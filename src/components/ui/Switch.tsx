import React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  ariaLabel,
  className = "",
}) => {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={`min-h-[44px] flex items-center justify-between gap-4 py-2 cursor-pointer select-none ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      } ${className}`}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-bold text-[var(--app-text)]">{label}</span>}
          {description && (
            <span className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              {description}
            </span>
          )}
        </div>
      )}

      <div className="relative inline-flex items-center shrink-0">
        <input
          id={switchId}
          type="checkbox"
          role="switch"
          aria-label={ariaLabel || label}
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-[var(--app-card-secondary)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--app-primary)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--app-primary)] border border-[var(--app-border)]" />
      </div>
    </label>
  );
};
