import type { SchoolProfileStatus } from "@/lib/api";

const MANAGEMENT_ENABLED_STATUSES: ReadonlySet<SchoolProfileStatus> = new Set(["VERIFIED", "PREMIUM"]);
const PREMIUM_ENABLED_STATUSES: ReadonlySet<SchoolProfileStatus> = new Set(["PREMIUM"]);

export function canManageSchoolByProfileStatus(status: SchoolProfileStatus | null | undefined) {
  if (!status) {
    return false;
  }

  return MANAGEMENT_ENABLED_STATUSES.has(status);
}

export function canAccessPremiumFeatures(status: SchoolProfileStatus | null | undefined) {
  if (!status) {
    return false;
  }

  return PREMIUM_ENABLED_STATUSES.has(status);
}

export function managementUnlockMessage(status: SchoolProfileStatus | null | undefined) {
  if (canManageSchoolByProfileStatus(status)) {
    return null;
  }

  if (status === "CURATED") {
    return "Tu perfil está curado por EduAdvisor. Para editar datos institucionales y gestionar leads debes verificar el colegio.";
  }

  return "Tu perfil todavía no está verificado. Verifica el colegio para habilitar edición de perfil y gestión de leads.";
}

export function premiumUnlockMessage(status: SchoolProfileStatus | null | undefined) {
  if (canAccessPremiumFeatures(status)) {
    return null;
  }

  if (status === "VERIFIED") {
    return "Tu colegio está verificado. Activá Premium para exportar leads y priorizar visibilidad.";
  }

  return "Activa verificación y Premium para desbloquear herramientas comerciales avanzadas.";
}
