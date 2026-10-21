import React from "react";
import {
  Base5Colors,
  hexToRgb,
  rgbToHsl,
  hslToHex,
} from "../../utils/paletteDerivation";

interface PaletteEditorControlsProps {
  baseColors: Base5Colors;
  onChange: (updated: Base5Colors) => void;
}

export const PaletteEditorControls: React.FC<PaletteEditorControlsProps> = ({
  baseColors,
  onChange,
}) => {
  const fields: { key: keyof Base5Colors; label: string; desc: string }[] = [
    { key: "bg", label: "Fundo Geral", desc: "Cor principal de fundo da tela" },
    { key: "surface", label: "Superfície / Cartão", desc: "Cor dos cartões e contêineres" },
    { key: "text", label: "Texto Principal", desc: "Cor dos títulos e leitura" },
    { key: "primary", label: "Destaque Primário", desc: "Botões, tabs e ênfase principal" },
    { key: "secondary", label: "Destaque Secundário", desc: "Badges, acentos e destaques" },
  ];

  const updateColor = (key: keyof Base5Colors, hex: string) => {
    onChange({
      ...baseColors,
      [key]: hex,
    });
  };

  const updateHsl = (
    key: keyof Base5Colors,
    part: "h" | "s" | "l",
    val: number
  ) => {
    const curHex = baseColors[key];
    const { r, g, b } = hexToRgb(curHex);
    const hsl = rgbToHsl(r, g, b);
    hsl[part] = val;
    const newHex = hslToHex(hsl.h, hsl.s, hsl.l);
    updateColor(key, newHex);
  };

  return (
    <div className="space-y-3">
      {fields.map(({ key, label, desc }) => {
        const hex = baseColors[key];
        const { r, g, b } = hexToRgb(hex);
        const hsl = rgbToHsl(r, g, b);

        return (
          <div
            key={key}
            className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[var(--app-text)] block">
                  {label}
                </span>
                <span className="text-[10px] text-[var(--app-text-muted)] block">
                  {desc}
                </span>
              </div>

              {/* Seletor de cor e Hex Input */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--app-border)] p-0.5 bg-transparent shrink-0"
                  title={`Escolher cor de ${label}`}
                  aria-label={`Seletor de cor para ${label}`}
                />
                <input
                  type="text"
                  maxLength={7}
                  value={hex.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith("#") && (val.length === 4 || val.length === 7)) {
                      updateColor(key, val);
                    } else if (!val.startsWith("#") && (val.length === 3 || val.length === 6)) {
                      updateColor(key, `#${val}`);
                    }
                  }}
                  className="w-20 px-2 py-1 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-lg text-xs font-mono font-bold text-[var(--app-text)] text-center outline-none focus:border-[var(--app-primary)]"
                  aria-label={`Código Hexadecimal para ${label}`}
                />
              </div>
            </div>

            {/* Controles HSL */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[var(--app-border)]/60 text-[10px] text-[var(--app-text-muted)]">
              {/* Matiz */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Matiz</span>
                  <span>{hsl.h}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hsl.h}
                  onChange={(e) => updateHsl(key, "h", parseInt(e.target.value))}
                  className="w-full accent-[var(--app-primary)] cursor-pointer h-1.5"
                  aria-label={`Matiz para ${label}`}
                />
              </div>

              {/* Saturação */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Sat.</span>
                  <span>{hsl.s}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.s}
                  onChange={(e) => updateHsl(key, "s", parseInt(e.target.value))}
                  className="w-full accent-[var(--app-primary)] cursor-pointer h-1.5"
                  aria-label={`Saturação para ${label}`}
                />
              </div>

              {/* Luminosidade */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Lum.</span>
                  <span>{hsl.l}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => updateHsl(key, "l", parseInt(e.target.value))}
                  className="w-full accent-[var(--app-primary)] cursor-pointer h-1.5"
                  aria-label={`Luminosidade para ${label}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
