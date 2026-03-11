import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type { ApiSchoolDetail } from "@/lib/api";
import { formatCurrency, formatRating } from "@/lib/format";

interface CompareTableProps {
  schools: ApiSchoolDetail[];
}

const rows: Array<{
  label: string;
  key:
    | "profile"
    | "score"
    | "googleRating"
    | "rating"
    | "fee"
    | "enrollmentFee"
    | "scholarships"
    | "students"
    | "levels"
    | "location"
    | "address"
    | "website";
}> = [
  { label: "Estado del perfil", key: "profile" },
  { label: "EduAdvisor Score", key: "score" },
  { label: "Rating en Google", key: "googleRating" },
  { label: "Valoración de familias", key: "rating" },
  { label: "Cuota estimada", key: "fee" },
  { label: "Matrícula", key: "enrollmentFee" },
  { label: "Becas", key: "scholarships" },
  { label: "Alumnos", key: "students" },
  { label: "Niveles", key: "levels" },
  { label: "Ubicación", key: "location" },
  { label: "Dirección", key: "address" },
  { label: "Sitio web", key: "website" }
];

export function CompareTable({ schools }: CompareTableProps) {
  const levelMap: Record<string, string> = {
    INICIAL: "Inicial",
    PRIMARIA: "Primaria",
    SECUNDARIA: "Secundaria"
  };
  const profileStatusLabel: Record<string, string> = {
    BASIC: "No verificado",
    CURATED: "Curado por EduAdvisor",
    VERIFIED: "Verificado",
    PREMIUM: "Premium"
  };
  const profileScore: Record<string, number> = {
    BASIC: 1,
    CURATED: 2,
    VERIFIED: 3,
    PREMIUM: 4
  };

  function comparableValue(rowKey: (typeof rows)[number]["key"], school: ApiSchoolDetail): number | null {
    if (rowKey === "score") {
      return school.eduAdvisorScore ?? null;
    }
    if (rowKey === "googleRating") {
      return school.quality?.google?.rating ?? null;
    }
    if (rowKey === "rating") {
      return school.rating.average ?? null;
    }
    if (rowKey === "fee") {
      return school.monthlyFeeEstimate ?? null;
    }
    if (rowKey === "enrollmentFee") {
      return school.enrollmentFee ?? null;
    }
    if (rowKey === "scholarships") {
      return school.scholarshipsAvailable ? 1 : 0;
    }
    if (rowKey === "profile") {
      return profileScore[school.profile.status] ?? 0;
    }
    return null;
  }

  function bestValueIndexes(rowKey: (typeof rows)[number]["key"]) {
    const measured = schools
      .map((school, index) => ({
        index,
        value: comparableValue(rowKey, school)
      }))
      .filter((entry): entry is { index: number; value: number } => entry.value !== null);

    if (measured.length <= 1) {
      return new Set<number>();
    }

    const maximize = rowKey !== "fee" && rowKey !== "enrollmentFee";
    const target = maximize
      ? Math.max(...measured.map((entry) => entry.value))
      : Math.min(...measured.map((entry) => entry.value));

    return new Set(measured.filter((entry) => entry.value === target).map((entry) => entry.index));
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-brand-100 bg-brand-50">
          <tr>
            <th className="px-4 py-3 text-slate-500">Atributo</th>
            {schools.map((school) => (
              <th key={school.id} className="px-4 py-3 text-ink">
                {school.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const bestIndexes = bestValueIndexes(row.key);
            return (
              <tr key={row.key} className="border-b border-brand-50 last:border-b-0">
                <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                {schools.map((school, index) => {
                let value: ReactNode = "-";
                const isBestValue = bestIndexes.has(index);

                if (row.key === "profile") value = profileStatusLabel[school.profile.status] ?? school.profile.label;
                if (row.key === "score") value = school.eduAdvisorScore?.toString() ?? "-";
                if (row.key === "googleRating") {
                  const googleRating = school.quality?.google?.rating ?? null;
                  const googleReviewCount = school.quality?.google?.reviewCount ?? 0;
                  value = googleRating !== null ? `${formatRating(googleRating)} (${googleReviewCount} reseñas)` : "Sin datos";
                }
                if (row.key === "rating") value = `${formatRating(school.rating.average)} (${school.rating.count})`;
                if (row.key === "fee") value = formatCurrency(school.monthlyFeeEstimate);
                if (row.key === "enrollmentFee") value = formatCurrency(school.enrollmentFee);
                if (row.key === "scholarships") value = school.scholarshipsAvailable ? "Sí" : "No informado";
                if (row.key === "students") value = school.studentsCount?.toString() ?? "No informado";
                if (row.key === "levels") {
                  value = school.levels.length > 0 ? school.levels.map((level) => levelMap[level] ?? level).join(", ") : "No informado";
                }
                if (row.key === "location") {
                  value = `${school.location.city}, ${school.location.province}`;
                }
                if (row.key === "address") {
                  value = school.location.addressLine ?? "No informado";
                }
                if (row.key === "website") {
                  value = school.contacts.website ? (
                    <a
                      href={school.contacts.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2"
                    >
                      Ver sitio
                    </a>
                  ) : (
                    "No informado"
                  );
                }

                  return (
                    <td
                      key={`${school.id}-${row.key}`}
                      className={`px-4 py-3 text-slate-700 ${isBestValue ? "bg-emerald-50/65 font-semibold text-emerald-900" : ""}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
