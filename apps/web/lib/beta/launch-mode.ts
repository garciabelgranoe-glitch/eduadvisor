export type LaunchMode = "PRIVATE" | "PUBLIC" | "OPEN";

const MODE_ALIASES: Record<string, LaunchMode> = {
  private: "PRIVATE",
  privada: "PRIVATE",
  public: "PUBLIC",
  publica: "PUBLIC",
  open: "OPEN",
  abierta: "OPEN",
  ga: "OPEN"
};

function isTruthy(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function resolveLaunchMode(): LaunchMode {
  const rawMode = process.env.LAUNCH_MODE?.trim().toLowerCase();
  if (rawMode && MODE_ALIASES[rawMode]) {
    return MODE_ALIASES[rawMode];
  }

  if (isTruthy(process.env.BETA_PRIVATE_MODE_ENABLED)) {
    return "PRIVATE";
  }

  return "OPEN";
}

export function isLaunchMode(mode: LaunchMode) {
  return resolveLaunchMode() === mode;
}
