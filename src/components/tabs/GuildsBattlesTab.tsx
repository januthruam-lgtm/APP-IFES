import React, { useState, useEffect } from "react";
import {
  Shield,
  Trophy,
  Users,
  Zap,
  Sparkles,
  CheckCircle2,
  Gift,
  Plus,
  X,
  Flame,
  ArrowRight,
} from "lucide-react";
import { UserProfile } from "../../types";
import confetti from "canvas-confetti";
import {
  RealEquipe,
  subscribeEquipes,
  createRealEquipe,
  joinRealEquipe,
  leaveRealEquipe,
} from "../../features/equipes/equipesService";

interface GuildsBattlesTabProps {
  user: UserProfile;
  onRewardXp: (xp: number) => void;
  onConsumeEnergy: (amount: number) => boolean;
  onAddEnergy: (amount: number) => void;
  onUpdateUserTeam: (teamId: string | null) => void;
}

const BADGE_OPTIONS = ["⚔️", "🛡️", "🔮", "⚡", "🚀", "💻", "📐", "🦉", "🔬", "🤖"];

export const GuildsBattlesTab: React.FC<GuildsBattlesTabProps> = ({
  user,
  onRewardXp,
  onUpdateUserTeam,
}) => {
  const [equipes, setEquipes] = useState<RealEquipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(user.teamId || null);
  const [chestClaimed, setChestClaimed] = useState(false);

  // Modal de Criação de Equipe
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [tag, setTag] = useState("");
  const [descricao, setDescricao] = useState("");
  const [badgeEmoji, setBadgeEmoji] = useState("⚔️");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const userId = user.email || user.name || "aluno_ifes";

  // Ouve em tempo real as equipes reais cadastradas no Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeEquipes((loadedEquipes) => {
      setEquipes(loadedEquipes);
      setIsLoading(false);

      // Sincroniza equipe do usuário se encontrada
      const userTeam = loadedEquipes.find((eq) => eq.membros.includes(userId));
      if (userTeam && userTeam.id !== activeTeamId) {
        setActiveTeamId(userTeam.id);
        onUpdateUserTeam(userTeam.id);
      }
    });

    return () => unsubscribe();
  }, [userId, activeTeamId, onUpdateUserTeam]);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleJoin = async (equipeId: string) => {
    try {
      // Se já estava em outra equipe, desvincula
      if (activeTeamId && activeTeamId !== equipeId) {
        await leaveRealEquipe(activeTeamId, userId);
      }
      await joinRealEquipe(equipeId, userId);
      setActiveTeamId(equipeId);
      onUpdateUserTeam(equipeId);
      confetti({ particleCount: 40, spread: 60 });
      showNotification("Você agora faz parte desta equipe acadêmica!");
    } catch (err: any) {
      showNotification(err?.message || "Erro ao entrar na equipe.");
    }
  };

  const handleCreateEquipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !tag.trim()) {
      showNotification("Preencha o nome e a tag da equipe.");
      return;
    }

    try {
      setIsSubmitting(true);
      const nova = await createRealEquipe({
        nome: nome.trim(),
        tag: tag.trim(),
        descricao: descricao.trim(),
        badgeEmoji,
        userId,
        userName: user.name || "Estudante IFES",
      });

      setActiveTeamId(nova.id);
      onUpdateUserTeam(nova.id);
      setIsModalOpen(false);
      setNome("");
      setTag("");
      setDescricao("");
      confetti({ particleCount: 70, spread: 80 });
      showNotification(`Equipe "${nova.nome}" criada com sucesso no IFES!`);
    } catch (err: any) {
      showNotification("Erro ao criar equipe: " + (err?.message || "Tente novamente"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimChest = () => {
    if (chestClaimed) return;
    setChestClaimed(true);
    confetti({ particleCount: 50, spread: 70 });
    onRewardXp(100);
    showNotification("+100 XP adicionados ao seu saldo!");
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Guildas & Equipes Acadêmicas IFES</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--app-text)]">
            Torneio de Equipes do IFES
          </h1>
          <p className="text-xs text-[var(--app-text-muted)]">
            Equipes formadas por estudantes reais. Estude, complete tarefas e suba no ranking!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[var(--app-primary)] hover:opacity-90 text-white transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Equipe</span>
          </button>

          <button
            onClick={handleClaimChest}
            disabled={chestClaimed}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-2 shadow-xs cursor-pointer ${
              chestClaimed
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 opacity-80"
                : "bg-amber-500 hover:bg-amber-400 text-black border-amber-400 animate-pulse"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{chestClaimed ? "Baú Semanal Resgatado" : "Baú Semanal (+100 XP)"}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold text-center animate-in slide-in-from-top-2">
          {feedback}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-[var(--app-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--app-text-muted)]">Carregando equipes do Firestore...</p>
        </div>
      ) : equipes.length === 0 ? (
        /* Empty State Amigável (NUNCA dados fictícios) */
        <div className="p-12 text-center rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[var(--app-text)]">
              Nenhuma equipe cadastrada ainda
            </h3>
            <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              Crie a primeira equipe acadêmica do IFES! Convide seus colegas de turma para estudar juntos e acumular pontos de XP no ranking.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-[var(--app-primary)] hover:opacity-90 text-white transition inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Fundar Primeira Equipe</span>
            </button>
          </div>
        </div>
      ) : (
        /* Lista de Equipes Reais */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equipes.map((equipe, index) => {
            const isUserInGuild = equipe.membros.includes(userId);
            const rank = index + 1;

            return (
              <div
                key={equipe.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                  isUserInGuild
                    ? "bg-[var(--app-card)] border-[var(--app-primary)] shadow-md ring-2 ring-[var(--app-primary)]/20"
                    : "bg-[var(--app-card)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{equipe.badgeEmoji}</span>
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                        rank === 1
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)]"
                      }`}
                    >
                      #{rank} no Ranking
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[var(--app-text)] flex items-center gap-1.5">
                      {equipe.nome}
                      <span className="text-xs font-semibold text-[var(--app-text-muted)]">[{equipe.tag}]</span>
                    </h3>
                    <p className="text-xs text-[var(--app-text-muted)] mt-1 line-clamp-2">
                      {equipe.descricao || `Liderada por ${equipe.liderNome}`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-xs text-[var(--app-text-muted)]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {equipe.membros.length} {equipe.membros.length === 1 ? "membro" : "membros"}
                    </span>
                    <span className="font-bold text-amber-500">{equipe.totalXp} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(equipe.id)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    isUserInGuild
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-[var(--app-card-secondary)] hover:bg-[var(--app-primary)] hover:text-white text-[var(--app-text)]"
                  }`}
                >
                  {isUserInGuild ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sua Equipe Atual</span>
                    </>
                  ) : (
                    <span>Participar desta Equipe</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação de Equipe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--app-text)] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--app-primary)]" />
                <span>Fundar Nova Equipe</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1">
                  Nome da Equipe
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alunos de Eletrotécnica 2026"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--app-text)] mb-1">
                    Tag (3 a 5 letras)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="Ex: ELETR"
                    value={tag}
                    onChange={(e) => setTag(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs font-mono uppercase text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--app-text)] mb-1">
                    Ícone do Brasão
                  </label>
                  <select
                    value={badgeEmoji}
                    onChange={(e) => setBadgeEmoji(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] cursor-pointer"
                  >
                    {BADGE_OPTIONS.map((emoji) => (
                      <option key={emoji} value={emoji}>
                        {emoji} Brasão
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1">
                  Descrição ou Lema
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Foco total em passar sem recuperação no IFES!"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-card-secondary)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--app-primary)] hover:opacity-90 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Gravando..." : "Confirmar e Fundar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
