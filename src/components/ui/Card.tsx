import React from "react";

export type CardVariant = "default" | "elevated" | "outlined" | "flat";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  variant?: CardVariant;
  interactive?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = "md",
  variant = "default",
  interactive = false,
  bordered = true,
  className = "",
  onClick,
  ...props
}) => {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-5",
    lg: "p-6 sm:p-8",
  };

  const variantStyles = {
    default: "bg-[var(--app-card)] shadow-xs",
    elevated: "bg-[var(--app-card)] shadow-md",
    outlined: "bg-transparent border border-[var(--app-border)]",
    flat: "bg-[var(--app-card-secondary)]",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-200 ${variantStyles[variant]} ${
        bordered && variant !== "outlined" ? "border border-[var(--app-border)]" : ""
      } ${paddingStyles[padding]} ${
        interactive
          ? "cursor-pointer hover:border-[var(--app-primary)]/40 hover:shadow-md active:scale-[0.99]"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
