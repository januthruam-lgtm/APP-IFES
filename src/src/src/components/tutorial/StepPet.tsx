import { motion } from "motion/react";
import { CheckCircle2, Sparkles } from "lucide-react";
import type { PetType } from "../../types";
import { Pet3DView } from "../pet3d/Pet3DView";
import { STARTER_PETS, type StarterPetOption } from "./starterPets";

interface StepPetProps {
  selectedPetType: PetType;
  petCustomName: string;
  onSelectPet: (pet: StarterPetOption) => void;
  onNameChange: (name: string) => void;
}

export function StepPet({
  selectedPetType,
  petCustomName,
  onSelectPet,
  onNameChange,
}: StepPetProps) {
  const selected = STARTER_PETS.find((p) => p.type === selectedPetType);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center space-y-1">
        <h3 className="text-lg sm:text-xl font-black text-[var(--app-text)] flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--app-primary)]" />
          <span>Escolha seu Pet Inicial</span>
        </h3>
        <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
          Selecione obrigatoriamente um pet companheiro para iniciar sua jornada. Ele evoluirá conforme você estuda!
        </p>
      </div>

      {/* Grade de pets com mascotes 3D */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {STARTER_PETS.map((pet) => {
          const isSelected = selectedPetType === pet.type;
          return (
            <div
              key={pet.type}
              onClick={() => onSelectPet(pet)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelectPet(pet);
              }}
              className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-1.5 select-none ${
                isSelected
                  ? "border-[var(--app-primary)] bg-[var(--app-primary)]/15 scale-[1.03] shadow-md"
                  : "border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:border-[var(--app-primary)]/50"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center shadow-sm z-10">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-xl bg-[var(--app-card)]/40 border border-[var(--app-border)]/50 overflow-hidden flex items-center justify-center pointer-events-none p-1">
                <Pet3DView
                  petType={pet.type}
                  petName={pet.defaultName}
                  size="sm"
                  className="w-full h-full"
                />
              </div>

              <div>
                <h4 className="text-xs font-black text-[var(--app-text)]">{pet.defaultName}</h4>
                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--app-card)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                  {pet.badge}
                </span>
              </div>

              <p className="text-[10px] text-[var(--app-text-muted)] leading-snug line-clamp-2">
                {pet.description}
              </p>

              <div className="w-full pt-1 border-t border-[var(--app-border)] text-[9px] font-bold text-[var(--app-primary)]">
                {pet.trait}
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel do pet selecionado, com campo de nome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3.5 rounded-3xl bg-[var(--app-card-secondary)] border-2 border-[var(--app-primary)]/30 flex flex-col sm:flex-row items-center gap-4"
      >
        {/* touch-pan-y: arrastar sobre o 3D também rola a tela */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-[var(--app-bg)]/80 border border-[var(--app-border)] overflow-hidden flex items-center justify-center p-1 shadow-inner touch-pan-y [&_canvas]:touch-pan-y!">
          <Pet3DView
            petType={selectedPetType}
            petName={petCustomName || selected?.defaultName}
            size="md"
            className="w-full h-full"
          />
        </div>
        <div className="flex-1 space-y-1.5 text-left w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[var(--app-text)]">
              Mascote 3D: {selected?.defaultName}
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--app-primary)]/15 text-[var(--app-primary)] font-bold">
              3D Ativo • Corpo & Cabeça Completos
            </span>
          </div>
          <label htmlFor="pet-name-input" className="text-[11px] font-bold text-[var(--app-text)] block">
            Nome do seu Mascote Companheiro:
          </label>
          <input
            id="pet-name-input"
            type="text"
            maxLength={20}
            value={petCustomName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={selected?.defaultName || "Nome do pet..."}
            className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold focus:outline-none focus:border-[var(--app-primary)] shadow-xs"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}