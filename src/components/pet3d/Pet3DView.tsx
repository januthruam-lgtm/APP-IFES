import React, { Suspense, lazy, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserPet } from "../../types";
import { useAccessibility } from "../../lib/accessibility";
import { getPetDefinition } from "../../features/gamificacao/petCatalog";

const LazyPet3DScene = lazy(() => import("./Pet3DScene"));

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

interface Pet3DViewProps {
  pet?: UserPet;
  petType?: string;
  petName?: string;
  className?: string;
  onPetClick?: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "hero" | "full";
  isJoyful?: boolean;
}

class PetErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: any) {
    console.warn("[Pet3DView] WebGL/Canvas error caught by boundary, using safe fallback:", err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const Pet3DView: React.FC<Pet3DViewProps> = ({
  pet,
  petType: petTypeProp,
  petName: petNameProp,
  className = "",
  onPetClick,
  size = "md",
  isJoyful = false,
}) => {
  const { t } = useTranslation();
  const { isReducedMotion } = useAccessibility();
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    setHasWebGL(checkWebGLSupport());
  }, []);

  const activeType = petTypeProp || pet?.type || (pet as any)?.activePetId || "coruja";
  const petDef = getPetDefinition(activeType);
  const displayName = petNameProp || pet?.name || petDef.nome || "Mascote";
  const petEmoji = (pet as any)?.customSpeciesEmoji || petDef.emoji;

  const hunger = pet?.hunger ?? 85;
  const energy = pet?.energy ?? 90;
  const happiness = pet?.happiness ?? 95;
  const level = pet?.level ?? 1;

  // Determinar humor descritivo para leitor de tela
  let moodLabel = t("pet.humor_feliz");
  if (hunger < 30) {
    moodLabel = t("pet.humor_faminto");
  } else if (energy < 30) {
    moodLabel = t("pet.humor_cansado");
  } else if (happiness < 50) {
    moodLabel = t("pet.humor_neutro");
  }

  const speciesName =
    activeType === "coruja" || activeType === "owl"
      ? t("pet.especie_coruja", "Coruja Sábia")
      : activeType === "raposa" || activeType === "fox"
      ? "Raposa Ágil"
      : activeType === "gato_robo" || activeType === "cat"
      ? "Gato-Robô"
      : activeType === "dragao_livro" || activeType === "dragon"
      ? "Dragão-Livro"
      : activeType === "bird"
      ? t("pet.especie_passaro", "Pássaro")
      : activeType === "elephant"
      ? t("pet.especie_elefante", "Elefante")
      : activeType === "tiger"
      ? t("pet.especie_tigre", "Tigre")
      : t("pet.especie_coelho", "Coelho");

  const accessibleLabel = t("pet.status_3d_desc", {
    name: displayName,
    species: speciesName,
    level,
    mood: moodLabel,
    energy,
  });

  const sizeClasses = {
    xs: "w-11 h-11",
    sm: "w-20 h-20 sm:w-24 sm:h-24",
    md: "w-36 h-36 sm:w-44 sm:h-44",
    lg: "w-52 h-52 sm:w-60 sm:h-60",
    hero: "w-64 h-64 sm:w-80 sm:h-80",
    full: "w-full h-full min-h-[140px]",
  };

  const isCustomSized = size === "full" || (className.includes("w-") && className.includes("h-"));
  const containerClasses = isCustomSized ? "w-full h-full" : sizeClasses[size];

  const emojiFallback = (
    <div className="w-full h-full flex flex-col items-center justify-center animate-bounce">
      <span className={`${size === "xs" ? "text-xl" : size === "sm" ? "text-3xl" : "text-6xl sm:text-7xl"} select-none filter drop-shadow-md`}>
        {petEmoji}
      </span>
      {size !== "xs" && size !== "sm" && (
        <span className="text-[10px] text-[var(--app-text-muted)] font-mono mt-1">
          {displayName}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-visible ${className}`}
      role="img"
      aria-label={accessibleLabel}
    >
      <div className={`relative ${containerClasses} flex items-center justify-center overflow-visible`}>
        {hasWebGL ? (
          <PetErrorBoundary fallback={emojiFallback}>
            <Suspense fallback={emojiFallback}>
              <LazyPet3DScene
                type={activeType}
                hunger={hunger}
                energy={energy}
                happiness={happiness}
                reducedMotion={isReducedMotion}
                onPetClick={onPetClick}
                isJoyful={isJoyful}
              />
            </Suspense>
          </PetErrorBoundary>
        ) : (
          emojiFallback
        )}
      </div>
    </div>
  );
};

export default Pet3DView;
