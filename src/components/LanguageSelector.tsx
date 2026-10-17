import React from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "../i18n";

interface LanguageSelectorProps {
  className?: string;
  variant?: "dropdown" | "list";
  onSelect?: (code: SupportedLanguageCode) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = "",
  variant = "list",
  onSelect,
}) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || "pt-BR";

  const handleSelect = (code: SupportedLanguageCode) => {
    i18n.changeLanguage(code);
    if (onSelect) onSelect(code);
  };

  if (variant === "dropdown") {
    return (
      <div className={`relative inline-flex items-center gap-2 ${className}`}>
        <Globe className="w-4 h-4 text-[var(--app-text-muted)] shrink-0" aria-hidden="true" />
        <select
          value={currentLang.startsWith("pt") ? "pt-BR" : currentLang.startsWith("es") ? "es" : "en"}
          onChange={(e) => handleSelect(e.target.value as SupportedLanguageCode)}
          aria-label={t("configuracoes.idioma_app")}
          className="bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[var(--app-primary)] cursor-pointer min-h-[44px]"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} role="radiogroup" aria-label={t("configuracoes.idioma_app")}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected =
          currentLang === lang.code ||
          (lang.code === "pt-BR" && currentLang === "pt");

        return (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(lang.code)}
            className={`w-full p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition min-h-[48px] cursor-pointer ${
              isSelected
                ? "bg-[var(--app-primary)]/10 border-[var(--app-primary)] text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]"
                : "bg-[var(--app-card)] border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">{lang.flag}</span>
              <span>{lang.label}</span>
            </div>
            {isSelected && <Check className="w-4 h-4 shrink-0 text-[var(--app-primary)]" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
};
