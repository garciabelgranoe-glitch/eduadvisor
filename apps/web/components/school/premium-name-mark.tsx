interface PremiumNameMarkProps {
  show: boolean;
  size?: "sm" | "md";
}

export function PremiumNameMark({ show, size = "md" }: PremiumNameMarkProps) {
  if (!show) {
    return null;
  }

  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-0.5 font-semibold text-amber-900 shadow-[0_4px_12px_rgba(146,92,36,0.14)] ${
        isSmall ? "text-[10px]" : "text-[11px]"
      }`}
      aria-label="Colegio premium"
      title="Colegio premium"
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"}
        fill="currentColor"
      >
        <path d="M8 1.5 9.8 5l3.9.6-2.8 2.8.7 3.9L8 10.6l-3.6 1.7.7-3.9L2.3 5.6 6.2 5 8 1.5Z" />
      </svg>
      <span className="uppercase tracking-[0.08em]">Premium</span>
    </span>
  );
}
