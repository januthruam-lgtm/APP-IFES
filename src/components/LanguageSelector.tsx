import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, Search, Sparkles, Loader2 } from "lucide-react";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode, changeAppLanguage } from "../i18n";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSelect = async (code: SupportedLanguageCode) => {
    setIsTranslating(true);
    try {
      await changeAppLanguage(code);
      if (onSelect) onSelect(code);
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_LANGUAGES.filter(
      (lang) =>
        lang.label.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const popularLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter((l) => l.popular);
  }, []);

  const otherLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter((l) => !l.popular);
  }, []);

  if (variant === "dropdown") {
    return (
      <div className={`relative inline-flex items-center gap-2 ${className}`}>
        {isTranslating ? (
          <Loader2 className="w-4 h-4 text-[var(--app-primary)] animate-spin shrink-0" />
        ) : (
          <Globe className="w-4 h-4 text-[var(--app-text-muted)] shrink-0" aria-hidden="true" />
        )}
        <select
          value={currentLang}
          onChange={(e) => handleSelect(e.target.value as SupportedLanguageCode)}
          aria-label={t("configuracoes.idioma_app", "Idioma do Aplicativo")}
          className="bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[var(--app-primary)] cursor-pointer min-h-[44px] max-w-[200px] truncate"
        >
          <optgroup label="⭐ Principais Idiomas">
            {popularLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="🌍 Mais de 100 Idiomas Mundiais">
            {otherLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Campo de Busca Rápida de Idioma */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--app-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("comum.pesquisar", "Pesquisar") + " entre 120+ idiomas (ex: francês, ja, de, ar)..."}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] rounded-2xl text-xs font-semibold outline-none focus:border-[var(--app-primary)] placeholder:text-[var(--app-text-muted)]"
        />
        {isTranslating && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-[var(--app-primary)] font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Traduzindo...</span>
          </div>
        )}
      </div>

      {/* Lista com rolagem confortável */}
      <div
        className="space-y-1.5 max-h-72 overflow-y-auto pr-1"
        role="radiogroup"
        aria-label={t("configuracoes.idioma_app", "Idioma do Aplicativo")}
      >
        {filteredLanguages.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--app-text-muted)]">
            Nenhum idioma encontrado com "{searchQuery}".
          </div>
        ) : (
          filteredLanguages.map((lang) => {
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
                className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition min-h-[48px] cursor-pointer ${
                  isSelected
                    ? "bg-[var(--app-primary)]/10 border-[var(--app-primary)] text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]"
                    : "bg-[var(--app-card)] border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0" aria-hidden="true">{lang.flag}</span>
                  <div className="text-left truncate">
                    <div className="truncate flex items-center gap-1.5">
                      <span>{lang.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          lang.status === "completo"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {lang.status === "completo" ? "Completo" : "Tradução Automática"}
                      </span>
                    </div>
                    {lang.nativeName !== lang.label && (
                      <div className="text-[10px] text-[var(--app-text-muted)] font-normal">{lang.nativeName}</div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 shrink-0 text-[var(--app-primary)] ml-2" aria-hidden="true" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
