type StatusTone = "ok" | "warn" | "danger" | "info";

type StatusPillProps = {
  label: string;
  tone: StatusTone;
};

export function StatusPill({ label, tone }: StatusPillProps) {
  return <span className={`status-pill ${tone}`}>{label}</span>;
}
