import { motion } from "motion/react";
import { BookOpen, MessageSquareCode, Heart } from "lucide-react";

export function StepWelcome() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 mb-1">
          <img
            src="/logo.png"
            alt="Brain Studio Logo"
            className="w-44 sm:w-52 h-auto object-contain mx-auto"
          />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[var(--app-text)]">
          Bem-vindo ao Brain Studio!
        </h3>
        <p className="text-xs sm:text-sm text-[var(--app-text-muted)] max-w-lg mx-auto leading-relaxed">
          Seu ecossistema inteligente de alta performance acadêmica. Conecte seus estudos,
          exercite sua mente com mentoria socrática e evolua junto com seu Pet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] mx-auto flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-[var(--app-text)]">Matérias IFES</h4>
          <p className="text-[11px] text-[var(--app-text-muted)]">
            Sincronize ou importe suas disciplinas com resumos estruturados.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--app-accent)]/15 text-[var(--app-accent)] mx-auto flex items-center justify-center">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-[var(--app-text)]">Tutor Socrático</h4>
          <p className="text-[11px] text-[var(--app-text-muted)]">
            IA Lumina que desafia seu raciocínio com perguntas investigativas.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-[var(--app-text)]">Pet Interativo</h4>
          <p className="text-[11px] text-[var(--app-text-muted)]">
            Ganhe XP para alimentar e subir o nível do seu companheiro de estudos.
          </p>
        </div>
      </div>
    </motion.div>
  );
}