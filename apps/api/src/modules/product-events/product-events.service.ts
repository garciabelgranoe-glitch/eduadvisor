import { Injectable } from "@nestjs/common";
import { ParentAlertType, Prisma, ProductEventType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

type DispatchInput = {
  type: ProductEventType;
  schoolId: string;
  dedupeKey: string;
  title: string;
  message: string;
  linkPath: string | null;
  payload?: Record<string, unknown>;
};

@Injectable()
export class ProductEventsService {
  private readonly scoreDeltaThreshold: number;

  constructor(private readonly prisma: PrismaService) {
    const parsed = Number(process.env.PARENT_ALERT_SCORE_DELTA_THRESHOLD ?? 4);
    this.scoreDeltaThreshold = Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
  }

  async emitReviewApproved(input: {
    reviewId: string;
    schoolId: string;
    schoolName: string;
    schoolSlug: string;
    rating: number;
  }) {
    return this.dispatchToSavedParents({
      type: ProductEventType.REVIEW_APPROVED,
      schoolId: input.schoolId,
      dedupeKey: `review-approved:${input.reviewId}`,
      title: "Nueva reseña aprobada",
      message: `${input.schoolName} recibió una nueva reseña de ${input.rating} estrellas.`,
      linkPath: `/school/${input.schoolSlug}`,
      payload: {
        reviewId: input.reviewId,
        rating: input.rating
      }
    });
  }

  async emitSchoolProfileUpdated(input: {
    schoolId: string;
    schoolName: string;
    schoolSlug: string;
    updatedAt: Date;
    changedFields: string[];
    previousMonthlyFeeEstimate: number | null;
    monthlyFeeEstimate: number | null;
  }) {
    if (input.changedFields.length === 0) {
      return {
        duplicate: false,
        skipped: true,
        reason: "NO_MEANINGFUL_CHANGES",
        alertsCreated: 0
      };
    }

    const feeChanged = input.previousMonthlyFeeEstimate !== input.monthlyFeeEstimate;
    const message = feeChanged
      ? `${input.schoolName} actualizó su perfil y cambió cuota estimada de ${this.formatMoney(
          input.previousMonthlyFeeEstimate
        )} a ${this.formatMoney(input.monthlyFeeEstimate)}.`
      : `${input.schoolName} actualizó su perfil institucional en EduAdvisor.`;

    return this.dispatchToSavedParents({
      type: ProductEventType.SCHOOL_PROFILE_UPDATED,
      schoolId: input.schoolId,
      dedupeKey: `school-profile-updated:${input.schoolId}:${input.updatedAt.toISOString()}`,
      title: "Perfil de colegio actualizado",
      message,
      linkPath: `/school/${input.schoolSlug}`,
      payload: {
        changedFields: input.changedFields,
        previousMonthlyFeeEstimate: input.previousMonthlyFeeEstimate,
        monthlyFeeEstimate: input.monthlyFeeEstimate
      }
    });
  }

  async emitEduAdvisorScoreChanged(input: {
    schoolId: string;
    schoolName: string;
    schoolSlug: string;
    previousScore: number;
    score: number;
    snapshotDate: Date;
  }) {
    const delta = Number((input.score - input.previousScore).toFixed(2));
    if (Math.abs(delta) < this.scoreDeltaThreshold) {
      return {
        duplicate: false,
        skipped: true,
        reason: "SCORE_DELTA_BELOW_THRESHOLD",
        alertsCreated: 0
      };
    }

    const trend = delta > 0 ? "subió" : "bajó";
    return this.dispatchToSavedParents({
      type: ProductEventType.EDUADVISOR_SCORE_CHANGED,
      schoolId: input.schoolId,
      dedupeKey: `eduadvisor-score-changed:${input.schoolId}:${this.toUtcDateKey(input.snapshotDate)}`,
      title: "Cambió el EduAdvisor Score",
      message: `El EduAdvisor Score de ${input.schoolName} ${trend} de ${input.previousScore.toFixed(1)} a ${input.score.toFixed(1)}.`,
      linkPath: `/school/${input.schoolSlug}`,
      payload: {
        previousScore: input.previousScore,
        score: input.score,
        delta
      }
    });
  }

  private async dispatchToSavedParents(input: DispatchInput) {
    let eventId: string | null = null;
    try {
      const event = await this.prisma.productEvent.create({
        data: {
          type: input.type,
          schoolId: input.schoolId,
          dedupeKey: input.dedupeKey,
          title: input.title,
          message: input.message,
          payload: input.payload ? (input.payload as Prisma.InputJsonValue) : undefined
        },
        select: {
          id: true
        }
      });
      eventId = event.id;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        return {
          duplicate: true,
          skipped: true,
          reason: "DUPLICATE_DEDUPE_KEY",
          alertsCreated: 0
        };
      }
      throw error;
    }

    const watchers = await this.prisma.savedSchool.findMany({
      where: {
        schoolId: input.schoolId
      },
      select: {
        userId: true
      }
    });

    if (watchers.length === 0) {
      return {
        duplicate: false,
        skipped: false,
        eventId,
        alertsCreated: 0
      };
    }

    const now = new Date();
    await this.prisma.parentAlert.createMany({
      data: watchers.map((watcher) => ({
        userId: watcher.userId,
        schoolId: input.schoolId,
        type: ParentAlertType.SCHOOL_UPDATE,
        title: input.title,
        message: input.message,
        linkPath: input.linkPath,
        payload: input.payload ? (input.payload as Prisma.InputJsonValue) : undefined,
        createdAt: now
      }))
    });

    await this.prisma.productEvent.update({
      where: {
        id: eventId
      },
      data: {
        alertsCreated: watchers.length
      }
    });

    return {
      duplicate: false,
      skipped: false,
      eventId,
      alertsCreated: watchers.length
    };
  }

  private toUtcDateKey(value: Date) {
    return value.toISOString().slice(0, 10);
  }

  private formatMoney(value: number | null) {
    if (value === null || value === undefined) {
      return "sin dato";
    }

    return `$${Math.round(value).toLocaleString("es-AR")}`;
  }

  private isUniqueConstraintError(error: unknown) {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    return "code" in error && (error as { code?: string }).code === "P2002";
  }
}
