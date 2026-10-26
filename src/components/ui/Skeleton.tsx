import React from "react";

export interface SkeletonProps {
  className?: string;
  circle?: boolean;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  circle = false,
  width,
  height,
  rounded,
}) => {
  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const defaultRounded = circle ? "rounded-full" : "rounded-xl";
  const activeRounded = rounded ? roundedStyles[rounded] : defaultRounded;

  return (
    <div
      aria-hidden="true"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      className={`animate-pulse bg-[var(--app-card-secondary)]/80 ${activeRounded} ${className}`}
    />
  );
};
