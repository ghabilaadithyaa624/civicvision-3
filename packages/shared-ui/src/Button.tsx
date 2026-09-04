import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
  secondary: "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      )}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? "Please wait…" : children}
    </button>
  );
}
