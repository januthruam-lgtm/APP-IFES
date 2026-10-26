import React from "react";

export type ButtonVariant = "primary" | "secondary" | "text" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--app-primary)] hover:opacity-90 text-white shadow-sm border border-transparent shadow-[0_2px_8px_rgba(232,93,4,0.25)]",
    secondary:
      "bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] border border-[var(--app-border)] shadow-xs",
    text: "bg-transparent hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border border-transparent",
    destructive:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent shadow-[0_2px_8px_rgba(225,29,72,0.25)]",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "min-h-[40px] px-3 py-1.5 text-xs rounded-xl gap-1.5",
    md: "min-h-[44px] px-4 py-2 text-sm rounded-xl gap-2",
    lg: "min-h-[50px] px-6 py-3 text-base rounded-2xl gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
