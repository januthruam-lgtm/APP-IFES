import React from "react";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = "Estudante",
  size = "md",
  online,
  className = "",
}) => {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const initial = (name.trim().charAt(0) || "E").toUpperCase();

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`${sizeStyles[size]} rounded-full overflow-hidden bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-center justify-center font-black text-[var(--app-text)] select-none shadow-xs ${className}`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {typeof online === "boolean" && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--app-card)] ${
            online ? "bg-emerald-500" : "bg-slate-400"
          }`}
          title={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};
