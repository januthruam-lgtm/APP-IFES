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
  Zap,
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
    } catch (e) {
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
        className="bg-[#111111] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#141414] to-[#1c1c1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  Cache Offline IndexedDB
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    isOnline
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/30"
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
              <p className="text-xs text-neutral-400">
                Acesse suas trilhas do IFES e flashcards sem gastar dados móveis ou sem internet
              </p>
            </div>
          </div>
          <button
            id="close-offline-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/5 bg-[#141414]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" /> Visão Geral & Status
          </button>
          <button
            onClick={() => setActiveTab("decks")}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === "decks"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Baralhos Flashcards ({stats.decksCount})
          </button>
          <button
            onClick={() => setActiveTab("tracks")}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === "tracks"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Trilhas Salvas ({stats.tracksCount})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {syncFeedback && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" /> Disciplinas
                  </span>
                  <p className="text-2xl font-black text-white font-mono">{stats.tracksCount}</p>
                  <p className="text-[10px] text-neutral-500">Salvas no IndexedDB</p>
                </div>

                <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> Módulos & Aulas
                  </span>
                  <p className="text-2xl font-black text-white font-mono">{stats.modulesCount}</p>
                  <p className="text-[10px] text-neutral-500">Com Quizzes Socráticos</p>
                </div>

                <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" /> Flashcards
                  </span>
                  <p className="text-2xl font-black text-white font-mono">{stats.flashcardsCount}</p>
                  <p className="text-[10px] text-neutral-500">Prontos para Revisão</p>
                </div>

                <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-400" /> Estado
                  </span>
                  <p className="text-sm font-extrabold text-emerald-400 flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-4 h-4" /> 100% Offline
                  </p>
                  <p className="text-[10px] text-neutral-500">No navegador local</p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-[#181818] to-[#141414] border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">
                      Armazenamento Local Ativo (NoSQL IndexedDB)
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
                    Todas as 12 disciplinas do 2º Ano do IFES, módulos de maiêutica socrática e 80+
                    flashcards conceituais estão armazenados no seu dispositivo.
                  </p>
                </div>
                <button
                  id="sync-now-indexeddb-btn"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Sincronizando..." : "Sincronizar Cache"}
                </button>
              </div>

              {/* How it works info */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                  Como Funciona o Modo Offline
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-[#181818] border border-white/5 rounded-xl space-y-1">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Trilhas & Aulas
                    </p>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      Você pode ler conceitos, responder quizzes de múltipla escolha e ganhar XP mesmo sem sinal de internet. O progresso é salvo no IndexedDB.
                    </p>
                  </div>

                  <div className="p-3 bg-[#181818] border border-white/5 rounded-xl space-y-1">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" /> Flashcards & Baralhos
                    </p>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
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
                <span className="text-xs font-bold text-neutral-300">
                  Baralhos de Flashcards em Cache ({decks.length})
                </span>
                <button
                  onClick={handleManualSync}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Atualizar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {decks.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 bg-[#181818] hover:bg-[#202020] border border-white/5 hover:border-white/15 rounded-2xl transition flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{d.icon}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-neutral-300 rounded-full border border-white/10 font-bold">
                          {d.cardCount} cards
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs mt-1.5">{d.subjectName}</h5>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {d.title}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectDeck(d.id);
                        onClose();
                      }}
                      className="w-full py-2 bg-white/5 hover:bg-emerald-500 hover:text-black text-neutral-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 group-hover:border-emerald-500/40 border border-white/5 cursor-pointer"
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
                <span className="text-xs font-bold text-neutral-300">
                  Disciplinas & Trilhas no IndexedDB ({courses.length})
                </span>
                <span className="text-[11px] text-neutral-500">Disponíveis Offline</span>
              </div>

              <div className="space-y-2">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-[#181818] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-[#202020] transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{c.icon}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-white text-xs truncate">{c.title}</h5>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {c.modules ? `${c.modules.length} Módulos socráticos` : "1 Módulo"} • {c.category}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTrack?.(c);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-[#e2ff31] hover:text-black text-neutral-300 text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
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
        <div className="p-4 border-t border-white/10 bg-[#141414] flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px]">
              Última sincronização: {new Date(stats.lastSync).toLocaleTimeString("pt-BR")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              className="text-[11px] text-neutral-500 hover:text-red-400 flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Redefinir Cache
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
