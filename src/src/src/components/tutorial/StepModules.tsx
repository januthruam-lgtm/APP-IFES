import { motion } from "motion/react";
import { Compass } from "lucide-react";

const MODULES = [
  {
    emoji: "📊",
    title: "Dashboard Geral",
    text: "Visão panorâmica da sua ofensiva (dias seguidos de estudo), barra de energia vital, cartas colecionáveis e status do seu pet.",
    box: "bg-[var(--app-primary)]/15 text-[var(--app-primary)]",
  },
  {
    emoji: "📚",
    title: "Matérias & Trilhas de Aprendizagem",
    text: "Acesse suas matérias com módulos conceituais, simulados automáticos, flashcards e verificação detalhada de respostas com IA.",
    box: "bg-[var(--app-primary)]/15 text-[var(--app-primary)]",
  },
  {
    emoji: "💡",
    title: "Tutor Socrático Lumina",
    text: "Diálogo maiêutico inteligente com histórico instantâneo e sínteses automáticas salvas direto na sua biblioteca.",
    box: "bg-[var(--app-accent)]/15 text-[var(--app-accent)]",
  },
  {
    emoji: "📖",
    title: "Biblioteca & Cadernos",
    text: "Armazenamento dos seus resumos acadêmicos, conversas salvas com o tutor e histórico de exercícios.",
    box: "bg-amber-500/15 text-amber-500",
  },
  {
    emoji: "🐾",
    title: "Loja & Cuidados com o Pet",
    text: "Alimente seu companheiro, compre recargas e expansões permanentes de energia e desbloqueie distintivos exclusivos.",
    box: "bg-purple-500/15 text-purple-500",
  },
];

export function StepModules() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-black text-[var(--app-text)] flex items-center gap-2">
          <Compass className="w-5 h-5 text-[var(--app-primary)]" />
          <span>Navegando no Brain Studio</span>
        </h3>
        <p className="text-xs text-[var(--app-text-muted)]">
          Conheça as abas fundamentais que organizam sua jornada acadêmica diária:
        </p>
      </div>

      <div className="space-y-2.5">
        {MODULES.map((m) => (
          <div
            key={m.title}
            className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3"
          >
            <div
              className={`w-8 h-8 rounded-xl ${m.box} flex items-center justify-center shrink-0 mt-0.5 font-black text-xs`}
            >
              {m.emoji}
            </div>
            <div>
              <h4 className="text-xs font-black text-[var(--app-text)]">{m.title}</h4>
              <p className="text-[11px] text-[var(--app-text-muted)]">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}