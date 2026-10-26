import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  id,
  className = "",
  disabled,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-[var(--app-text)] select-none">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-[var(--app-text-muted)] pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`w-full min-h-[44px] rounded-xl bg-[var(--app-bg)] text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)]/70 border transition-all duration-200 outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-transparent ${
            leftIcon ? "pl-10" : "pl-3.5"
          } ${rightIcon ? "pr-10" : "pr-3.5"} ${
            errorMessage
              ? "border-rose-500 focus:ring-rose-500"
              : "border-[var(--app-border)] hover:border-[var(--app-border)]/80"
          } ${disabled ? "opacity-40 cursor-not-allowed bg-[var(--app-card-secondary)]" : ""} ${className}`}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3.5 text-[var(--app-text-muted)]">{rightIcon}</span>
        )}
      </div>

      {errorMessage ? (
        <p className="text-xs text-rose-500 font-medium animate-in fade-in">{errorMessage}</p>
      ) : helperText ? (
        <p className="text-xs text-[var(--app-text-muted)]">{helperText}</p>
      ) : null}
    </div>
  );
};
