import React from "react";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "card";
  lines?: number;
  width?: string;
  height?: string;
}

/**
 * Componente padrão de Skeleton do Brain Studio.
 * Fornece feedback visual durante carregamentos assíncronos respeitando prefers-reduced-motion.
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = "",
  variant = "rectangular",
  lines = 1,
  width,
  height,
}) => {
  const baseClasses =
    "bg-[var(--app-border,#D9DFD3)]/40 dark:bg-[var(--app-border,#263238)]/60 animate-pulse rounded-2xl";

  if (variant === "circular") {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{ width: width || "48px", height: height || "48px" }}
        aria-hidden="true"
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`p-5 rounded-3xl bg-[var(--app-card,#FBFAF5)] border border-[var(--app-border,#D9DFD3)] space-y-3.5 ${className}`}
        aria-hidden="true"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--app-border,#D9DFD3)]/40 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="w-1/3 h-3.5 bg-[var(--app-border,#D9DFD3)]/40 rounded-lg animate-pulse" />
            <div className="w-2/3 h-2.5 bg-[var(--app-border,#D9DFD3)]/30 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="w-full h-16 bg-[var(--app-border,#D9DFD3)]/25 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (variant === "text" && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} h-3 rounded-lg ${
              i === lines - 1 ? "w-2/3" : "w-full"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        width: width || (variant === "text" ? "100%" : undefined),
        height: height || (variant === "text" ? "14px" : "48px"),
      }}
      aria-hidden="true"
    />
  );
};

export default LoadingSkeleton;
