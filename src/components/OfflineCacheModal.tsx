import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  CheckCircle2,
  Layers,
  BookOpen,
  Sparkles,
  Trash2,
  X,
  HardDrive,
  Info,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { CourseTrack } from "../types";
import {
  getOfflineCacheStats,
  seedDefaultOfflineCache,
  clearOfflineCache,
  getCachedDecks,
  cacheStudyTracks,
} from "../utils/indexedDB";
import { DeckInfo } from "../data/offlineFlashcards";

interface OfflineCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline?: boolean;
  courses: CourseTrack[];
  onSelectTrack?: (track: CourseTrack) => void;
  onSelectDeck: (deckId: string) => void;
}

export const OfflineCacheModal: React.FC<OfflineCacheModalProps> = ({
  isOpen,
  onClose,
  isOnline = true,
  courses,
  onSelectTrack,
  onSelectDeck,
}) => {
  const [stats, setStats] = useState<{
    tracksCount: number;
    modulesCount: number;
    flashcardsCount: number;
    decksCount: number;
    lastSync: string;
    isAvailableOffline: boolean;
  }>({
    tracksCount: 0,
    modulesCount: 0,
    flashcardsCount: 0,
    decksCount: 0,
    lastSync: new Date().toISOString(),
    isAvailableOffline: true,
  });

  const [decks, setDecks] = useState<DeckInfo[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "decks" | "tracks">("overview");

  const loadData = async () => {
    const s = await getOfflineCacheStats();
    setStats(s);
    const d = await getCachedDecks();
    setDecks(d);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("brainstudio:offline-cache-updated", handleUpdate);
    return () => window.removeEventListener("brainstudio:offline-cache-updated", handleUpdate);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback("Sincronizando trilhas de estudo e flashcards no IndexedDB...");
    try {
      await seedDefaultOfflineCache(courses);
      await cacheStudyTracks(courses);
      await loadData();
      setSyncFeedback("✅ Todas as trilhas e flashcards foram armazenados com sucesso no IndexedDB!");
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback("❌ Erro ao atualizar cache no IndexedDB.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm("Deseja realmente limpar o cache do IndexedDB? Os dados serão recarregados do catálogo padrão.")) {
      setIsSyncing(true);
      await clearOfflineCache();
      await seedDefaultOfflineCache(courses);
      await loadData();
      setIsSyncing(false);
      setSyncFeedback("Cache redefinido e recarregado.");
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="offline-cache-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="offline-cache-modal"
        className="bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--app-border)] flex items-center justify-between bg-[var(--app-card-secondary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/15 border border-[var(--app-primary)]/30 flex items-center justify-center text-[var(--app-primary)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[var(--app-text)] tracking-tight">
                  Cache Offline IndexedDB
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    isOnline
                      ? "text-[var(--app-success)] bg-[var(--app-success)]/10 border-[var(--app-success)]/30"
                      : "text-amber-500 bg-amber-500/10 border-amber-500/30"
                  }`}
                >
                  {isOnline ? (
                    <>
                      <Wifi className="w-3 h-3" /> Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" /> Modo Offline Ativo
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-[var(--app-text-muted)]">
                Acesse suas trilhas do IFES e flashcards sem gastar dados móveis ou sem internet
              </p>
            </div>
          </div>
          <button
            id="close-offline-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] flex items-center justify-center transition border border-[var(--app-border)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "overview"
                ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" /> Visão Geral & Status
          </button>
          <button
            onClick={() => setActiveTab("decks")}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "decks"
                ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Baralhos Flashcards ({stats.decksCount})
          </button>
          <button
            onClick={() => setActiveTab("tracks")}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "tracks"
                ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Trilhas Salvas ({stats.tracksCount})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {syncFeedback && (
            <div className="p-3.5 bg-[var(--app-success)]/10 border border-[var(--app-success)]/30 rounded-2xl flex items-center gap-2.5 text-xs text-[var(--app-success)] animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[var(--app-primary)]" /> Disciplinas
                  </span>
                  <p className="text-2xl font-black text-[var(--app-text)] font-mono">{stats.tracksCount}</p>
                  <p className="text-[10px] text-[var(--app-text-muted)]">Salvas no IndexedDB</p>
                </div>

                <div className="p-4 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[var(--app-accent)]" /> Módulos & Aulas
                  </span>
                  <p className="text-2xl font-black text-[var(--app-text)] font-mono">{stats.modulesCount}</p>
                  <p className="text-[10px] text-[var(--app-text-muted)]">Com Quizzes Socráticos</p>
                </div>

                <div className="p-4 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-500" /> Flashcards
                  </span>
                  <p className="text-2xl font-black text-[var(--app-text)] font-mono">{stats.flashcardsCount}</p>
                  <p className="text-[10px] text-[var(--app-text-muted)]">Prontos para Revisão</p>
                </div>

                <div className="p-4 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[var(--app-success)]" /> Estado
                  </span>
                  <p className="text-sm font-extrabold text-[var(--app-success)] flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-4 h-4" /> 100% Offline
                  </p>
                  <p className="text-[10px] text-[var(--app-text-muted)]">No navegador local</p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[var(--app-primary)]" />
                    <h4 className="text-sm font-bold text-[var(--app-text)]">
                      Armazenamento Local Ativo (NoSQL IndexedDB)
                    </h4>
                  </div>
                  <p className="text-xs text-[var(--app-text-muted)] leading-relaxed max-w-md">
                    Todas as disciplinas do IFES, módulos de maiêutica socrática e
                    flashcards conceituais estão armazenados no seu dispositivo.
                  </p>
                </div>
                <button
                  id="sync-now-indexeddb-btn"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-4 py-2.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-xs shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Sincronizando..." : "Sincronizar Cache"}
                </button>
              </div>

              {/* How it works info */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--app-text-muted)]">
                  Como Funciona o Modo Offline
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl space-y-1">
                    <p className="font-bold text-[var(--app-text)] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Trilhas & Aulas
                    </p>
                    <p className="text-[var(--app-text-muted)] text-[11px] leading-relaxed">
                      Você pode ler conceitos, responder quizzes de múltipla escolha e ganhar XP mesmo sem sinal de internet. O progresso é salvo no IndexedDB.
                    </p>
                  </div>

                  <div className="p-3 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl space-y-1">
                    <p className="font-bold text-[var(--app-text)] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-500" /> Flashcards & Baralhos
                    </p>
                    <p className="text-[var(--app-text-muted)] text-[11px] leading-relaxed">
                      Revise cartões de memória por disciplina com repetição espaçada (Fácil, Médio, Difícil). Novos flashcards gerados por PDF são cacheados automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "decks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--app-text)]">
                  Baralhos de Flashcards em Cache ({decks.length})
                </span>
                <button
                  onClick={handleManualSync}
                  className="text-xs text-[var(--app-primary)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Atualizar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {decks.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] rounded-2xl transition flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{d.icon}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--app-card)] text-[var(--app-text)] rounded-full border border-[var(--app-border)] font-bold">
                          {d.cardCount} cards
                        </span>
                      </div>
                      <h5 className="font-bold text-[var(--app-text)] text-xs mt-1.5">{d.subjectName}</h5>
                      <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-2 mt-0.5 leading-relaxed">
                        {d.title}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectDeck(d.id);
                        onClose();
                      }}
                      className="w-full py-2 bg-[var(--app-card)] hover:bg-[var(--app-primary)] hover:text-white text-[var(--app-text)] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 border border-[var(--app-border)] cursor-pointer"
                    >
                      <span>Estudar Flashcards</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tracks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--app-text)]">
                  Disciplinas & Trilhas no IndexedDB ({courses.length})
                </span>
                <span className="text-[11px] text-[var(--app-text-muted)]">Disponíveis Offline</span>
              </div>

              <div className="space-y-2">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl flex items-center justify-between hover:bg-[var(--app-card-hover)] transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{c.icon}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-[var(--app-text)] text-xs truncate">{c.title}</h5>
                        <p className="text-[10px] text-[var(--app-text-muted)] truncate">
                          {c.modules ? `${c.modules.length} Módulos socráticos` : "1 Módulo"} • {c.category}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTrack?.(c);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Abrir Trilha</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-card-secondary)] flex items-center justify-between text-xs text-[var(--app-text-muted)]">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              Última sincronização: {new Date(stats.lastSync).toLocaleTimeString("pt-BR")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              className="text-[11px] text-[var(--app-text-muted)] hover:text-rose-500 flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Redefinir Cache
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] border border-[var(--app-border)] font-bold rounded-xl transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
