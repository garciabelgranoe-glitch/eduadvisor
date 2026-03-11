import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  children?: ReactNode;
};

const styles: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 shadow-[0_10px_30px_rgba(31,92,77,0.35)]",
  secondary:
    "bg-amber-200 text-amber-950 hover:bg-amber-300 border border-amber-300",
  ghost: "bg-white/70 text-ink hover:bg-white border border-brand-100"
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 rounded-lg px-3 text-xs",
  md: "h-10 rounded-xl px-4 text-sm",
  lg: "h-11 rounded-xl px-5 text-sm"
};

export function Button({ className, variant = "primary", size = "md", asChild = false, children, ...props }: ButtonProps) {
  const composedClassName = cn(
    "ea-focus-ring inline-flex items-center justify-center font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    styles[variant],
    sizeStyles[size],
    className
  );

  if (asChild) {
    if (!isValidElement(children)) {
      return null;
    }

    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      ...(props as object),
      className: cn(composedClassName, child.props.className)
    });
  }

  return (
    <button
      className={composedClassName}
      {...props}
    >
      {children}
    </button>
  );
}
