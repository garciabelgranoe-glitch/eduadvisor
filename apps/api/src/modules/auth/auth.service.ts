import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClaimStatus, SchoolProfileStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAuthSessionDto } from "./dto/create-auth-session.dto";
import { GetSchoolClaimStatusDto } from "./dto/get-school-claim-status.dto";

type SchoolAccessReasonCode =
  | "ACCESS_GRANTED"
  | "SCHOOL_NOT_FOUND"
  | "SCHOOL_NOT_VERIFIED"
  | "CLAIM_REQUIRED"
  | "CLAIM_PENDING"
  | "CLAIM_UNDER_REVIEW"
  | "CLAIM_REJECTED";

interface SchoolAccessStatus {
  canLogin: boolean;
  reasonCode: SchoolAccessReasonCode;
  message: string;
  school: {
    id: string;
    slug: string;
    name: string;
    profileStatus: SchoolProfileStatus;
  } | null;
  representative: {
    id: string;
    email: string;
    verifiedAt: Date | null;
  } | null;
  claim: {
    status: ClaimStatus | "NO_CLAIM";
    createdAt: Date | null;
    reviewedAt: Date | null;
  };
}

@Injectable()
export class AuthService {
  private static readonly loginEnabledSchoolStatuses = new Set<SchoolProfileStatus>([
    SchoolProfileStatus.VERIFIED,
    SchoolProfileStatus.PREMIUM
  ]);

  constructor(private readonly prisma: PrismaService) {}

  async createSession(payload: CreateAuthSessionDto) {
    const email = payload.email.trim().toLowerCase();

    if (payload.role === UserRole.PARENT) {
      const user = await this.upsertUser(email, UserRole.PARENT);
      return {
        user,
        scope: null
      };
    }

    if (payload.role !== UserRole.SCHOOL_ADMIN) {
      throw new ForbiddenException("Only parent and school admin sessions are allowed");
    }

    const schoolSlug = payload.schoolSlug?.trim().toLowerCase();
    if (!schoolSlug) {
      throw new ForbiddenException("schoolSlug is required for school admin session");
    }

    const access = await this.resolveSchoolAccess(email, schoolSlug);

    if (!access.school) {
      throw new NotFoundException({
        code: "SCHOOL_NOT_FOUND",
        message: "School not found"
      });
    }

    if (!access.canLogin) {
      throw new ForbiddenException({
        code: access.reasonCode,
        message: access.message
      });
    }

    const user = await this.upsertUser(email, UserRole.SCHOOL_ADMIN);

    return {
      user,
      scope: {
        schoolId: access.school.id,
        schoolSlug: access.school.slug,
        schoolName: access.school.name
      }
    };
  }

  async getSchoolClaimStatus(payload: GetSchoolClaimStatusDto) {
    const email = payload.email.trim().toLowerCase();
    const schoolSlug = payload.schoolSlug.trim().toLowerCase();
    const access = await this.resolveSchoolAccess(email, schoolSlug);

    return {
      canLogin: access.canLogin,
      reasonCode: access.reasonCode,
      message: access.message,
      school: access.school,
      representative: access.representative,
      claim: access.claim
    };
  }

  private async upsertUser(email: string, role: UserRole) {
    return this.prisma.user.upsert({
      where: { email },
      update: { role },
      create: {
        email,
        role
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
  }

  private async resolveSchoolAccess(email: string, schoolSlug: string): Promise<SchoolAccessStatus> {
    const school = await this.prisma.school.findFirst({
      where: {
        slug: schoolSlug,
        active: true
      },
      select: {
        id: true,
        slug: true,
        name: true,
        profileStatus: true
      }
    });

    if (!school) {
      return {
        canLogin: false,
        reasonCode: "SCHOOL_NOT_FOUND",
        message: "No encontramos ese colegio en EduAdvisor.",
        school: null,
        representative: null,
        claim: {
          status: "NO_CLAIM",
          createdAt: null,
          reviewedAt: null
        }
      };
    }

    const representative = await this.prisma.schoolRepresentative.findFirst({
      where: {
        schoolId: school.id,
        email: {
          equals: email,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        email: true,
        verifiedAt: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    if (!representative) {
      return {
        canLogin: false,
        reasonCode: "CLAIM_REQUIRED",
        message: "Esta cuenta no tiene un claim aprobado para el colegio seleccionado.",
        school,
        representative: null,
        claim: {
          status: "NO_CLAIM",
          createdAt: null,
          reviewedAt: null
        }
      };
    }

    const latestClaim = await this.prisma.schoolClaimRequest.findFirst({
      where: {
        schoolId: school.id,
        representativeId: representative.id
      },
      select: {
        status: true,
        createdAt: true,
        reviewedAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const schoolLoginEnabled = AuthService.loginEnabledSchoolStatuses.has(school.profileStatus);

    if (!latestClaim) {
      return {
        canLogin: false,
        reasonCode: "CLAIM_REQUIRED",
        message: "No encontramos un claim para esta cuenta. Inicia una solicitud de claim para acceder.",
        school,
        representative,
        claim: {
          status: "NO_CLAIM",
          createdAt: null,
          reviewedAt: null
        }
      };
    }

    if (latestClaim.status === ClaimStatus.PENDING) {
      return {
        canLogin: false,
        reasonCode: "CLAIM_PENDING",
        message: "Tu claim está pendiente de revisión. Te notificaremos por email al ser validado.",
        school,
        representative,
        claim: latestClaim
      };
    }

    if (latestClaim.status === ClaimStatus.UNDER_REVIEW) {
      return {
        canLogin: false,
        reasonCode: "CLAIM_UNDER_REVIEW",
        message: "Tu claim está en revisión por el equipo de EduAdvisor.",
        school,
        representative,
        claim: latestClaim
      };
    }

    if (latestClaim.status === ClaimStatus.REJECTED) {
      return {
        canLogin: false,
        reasonCode: "CLAIM_REJECTED",
        message: "El claim fue rechazado. Puedes enviar una nueva solicitud con datos actualizados.",
        school,
        representative,
        claim: latestClaim
      };
    }

    if (!schoolLoginEnabled) {
      return {
        canLogin: false,
        reasonCode: "SCHOOL_NOT_VERIFIED",
        message: "El colegio todavía no está verificado para acceder al panel institucional.",
        school,
        representative,
        claim: latestClaim
      };
    }

    return {
      canLogin: true,
      reasonCode: "ACCESS_GRANTED",
      message: "Cuenta verificada para acceder al dashboard del colegio.",
      school,
      representative,
      claim: latestClaim
    };
  }
}
