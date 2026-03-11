import { APP_ROLE_PARENT, APP_ROLE_SCHOOL_ADMIN } from "@/lib/auth/session";
import { resolveLaunchMode, type LaunchMode } from "@/lib/beta/launch-mode";

export const PRIVATE_BETA_ACCESS_PATH = "/beta-acceso";

function isTruthy(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function parseCsvToSet(value: string | undefined) {
  if (!value) {
    return new Set<string>();
  }

  const items = value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return new Set(items);
}

function hasWildcard(set: Set<string>) {
  return set.has("*");
}

function getPrivateBetaConfig() {
  return {
    launchMode: resolveLaunchMode(),
    allowedParentEmails: parseCsvToSet(process.env.BETA_PRIVATE_ALLOWED_PARENT_EMAILS),
    allowedSchoolSlugs: parseCsvToSet(process.env.BETA_PRIVATE_ALLOWED_SCHOOL_SLUGS),
    allowedSchoolEmails: parseCsvToSet(process.env.BETA_PRIVATE_ALLOWED_SCHOOL_EMAILS)
  };
}

export interface PrivateBetaAccessResult {
  launchMode: LaunchMode;
  allowed: boolean;
  reasonCode:
    | "BETA_DISABLED"
    | "BETA_ALLOWED"
    | "PARENT_NOT_INVITED"
    | "SCHOOL_NOT_INVITED"
    | "ROLE_NOT_ELIGIBLE";
}

export function evaluatePrivateBetaAccess(session: { role: string; email: string; schoolSlug: string | null }): PrivateBetaAccessResult {
  const config = getPrivateBetaConfig();
  if (config.launchMode === "OPEN") {
    return {
      launchMode: config.launchMode,
      allowed: true,
      reasonCode: "BETA_DISABLED"
    };
  }

  const email = session.email.trim().toLowerCase();

  if (session.role === APP_ROLE_PARENT) {
    const allowed =
      config.launchMode === "PUBLIC" ||
      hasWildcard(config.allowedParentEmails) ||
      config.allowedParentEmails.has(email);
    return {
      launchMode: config.launchMode,
      allowed,
      reasonCode: allowed ? "BETA_ALLOWED" : "PARENT_NOT_INVITED"
    };
  }

  if (session.role === APP_ROLE_SCHOOL_ADMIN) {
    const schoolSlug = session.schoolSlug?.trim().toLowerCase() ?? "";
    const allowedBySlug =
      schoolSlug.length > 0 && (hasWildcard(config.allowedSchoolSlugs) || config.allowedSchoolSlugs.has(schoolSlug));
    const allowedByEmail = hasWildcard(config.allowedSchoolEmails) || config.allowedSchoolEmails.has(email);
    const allowed = allowedBySlug || allowedByEmail;

    return {
      launchMode: config.launchMode,
      allowed,
      reasonCode: allowed ? "BETA_ALLOWED" : "SCHOOL_NOT_INVITED"
    };
  }

  return {
    launchMode: config.launchMode,
    allowed: false,
    reasonCode: "ROLE_NOT_ELIGIBLE"
  };
}
