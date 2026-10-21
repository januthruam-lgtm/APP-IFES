import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BookMarked,
  Search,
  BookOpen,
  Bookmark,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  Layers,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Eye,
  Type,
  Sun,
  Moon,
  Coffee,
  Download,
  Share2,
} from "lucide-react";
import { UserProfile } from "../../types";
import { ObraBiblioteca, LicencaObra, LICENCAS_ALLOWLIST, calcularElegibilidadeDominioPublico } from "../../types/library";
import { OBRAS_INICIAIS } from "../../data/obrasBiblioteca";
import { speakText, stopSpeaking, isSpeaking } from "../../lib/speech";
import DictionaryBottomSheet from "../dictionary/DictionaryBottomSheet";

interface LibraryTabProps {
  user: UserProfile;
  onOpenSocraticWithContext?: (topic: string, context?: string) => void;
  onOpenDeckWithDocument?: () => void;
  onCreateFlashcard?: (front: string, back: string) => void;
  onRewardXp?: (xp: number) => void;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  user,
  onOpenSocraticWithContext,
  onOpenDeckWithDocument,
  onCreateFlashcard,
  onRewardXp,
}) => {
  const { t, i18n } = useTranslation();

  // Acervo de obras (iniciais + salvas no localStorage)
  const [obras, setObras] = useState<ObraBiblioteca[]>(() => {
    try {
      const saved = localStorage.getItem("brain_biblioteca_obras");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return OBRAS_INICIAIS;
  });

  // Filtros de busca
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLicenca, setSelectedLicenca] = useState<string>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Favoritos e Progresso de Leitura
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const fav = localStorage.getItem("brain_biblioteca_favs");
      return fav ? JSON.parse(fav) : [];
    } catch {
      return [];
    }
  });

  const [readingProgress, setReadingProgress] = useState<Record<string, { capituloIndex: number; percent: number }>>(() => {
    try {
      const p = localStorage.getItem("brain_biblioteca_progresso");
      return p ? JSON.parse(p) : {};
    } catch {
      return {};
    }
  });

  // Leitor Interno (Reader Modal)
  const [activeReadingBook, setActiveReadingBook] = useState<ObraBiblioteca | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [readerFontSize, setReaderFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [readerTheme, setReaderTheme] = useState<"sepia" | "light" | "dark">("sepia");
  const [readerFontFamily, setReaderFontFamily] = useState<"serif" | "sans" | "dyslexic">("serif");
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  // Seleção de Texto no Leitor para Lumina / Dicionário / Flashcards
  const [selectedText, setSelectedText] = useState("");
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);

  // Modal de Cadastro/Revisão de Obra
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitulo, setNewTitulo] = useState("");
  const [newAutor, setNewAutor] = useState("");
  const [newAnoMorte, setNewAnoMorte] = useState<number | "">("");
  const [newCategoria, setNewCategoria] = useState("Literatura Brasileira");
  const [newLicenca, setNewLicenca] = useState<LicencaObra>("Domínio Público");
  const [newFonteNome, setNewFonteNome] = useState("Portal Domínio Público (MEC)");
  const [newFonteUrl, setNewFonteUrl] = useState("");
  const [newAtribuicao, setNewAtribuicao] = useState("");
  const [newSinopse, setNewSinopse] = useState("");
  const [newTextoCapitulo, setNewTextoCapitulo] = useState("");

  // Salvar obras no localStorage
  const saveObrasState = (novasObras: ObraBiblioteca[]) => {
    setObras(novasObras);
    try {
      localStorage.setItem("brain_biblioteca_obras", JSON.stringify(novasObras));
    } catch {}
  };

  // Toggle Favorito
  const toggleFavorite = (obraId: string) => {
    const next = favorites.includes(obraId)
      ? favorites.filter((id) => id !== obraId)
      : [...favorites, obraId];
    setFavorites(next);
    try {
      localStorage.setItem("brain_biblioteca_favs", JSON.stringify(next));
    } catch {}
  };

  // Denunciar problema de licença
  const handleReportLicense = (obraId: string) => {
    if (confirm(t("biblioteca.confirmar_denuncia", "Deseja denunciar esta obra por possível inconsistência de licença? Ela será ocultada para revisão."))) {
      const atualizadas = obras.map((o) =>
        o.id === obraId ? { ...o, ativo: false, denunciada: true } : o
      );
      saveObrasState(atualizadas);
      if (activeReadingBook?.id === obraId) {
        setActiveReadingBook(null);
      }
    }
  };

  // Abrir Leitor Interno
  const handleOpenReader = (obra: ObraBiblioteca) => {
    const prog = readingProgress[obra.id];
    setActiveReadingBook(obra);
    setActiveChapterIndex(prog?.capituloIndex || 0);
    stopSpeaking();
    setIsTtsPlaying(false);
  };

  // Atualizar progresso de leitura
  const handleUpdateChapter = (newIndex: number) => {
    if (!activeReadingBook) return;
    const totalCaps = activeReadingBook.capitulos.length;
    const percent = Math.round(((newIndex + 1) / totalCaps) * 100);

    setActiveChapterIndex(newIndex);
    stopSpeaking();
    setIsTtsPlaying(false);

    const updated = {
      ...readingProgress,
      [activeReadingBook.id]: { capituloIndex: newIndex, percent },
    };
    setReadingProgress(updated);
    try {
      localStorage.setItem("brain_biblioteca_progresso", JSON.stringify(updated));
    } catch {}

    // Conceder XP por leitura
    if (onRewardXp) {
      onRewardXp(15);
    }
  };

  // Síntese de Voz (TTS) no Leitor
  const handleToggleTts = () => {
    if (!activeReadingBook) return;
    const cap = activeReadingBook.capitulos[activeChapterIndex];
    if (!cap) return;

    if (isTtsPlaying) {
      stopSpeaking();
      setIsTtsPlaying(false);
    } else {
      speakText(cap.conteudo, {
        lang: activeReadingBook.idioma || i18n.language || "pt-BR",
        onEnd: () => setIsTtsPlaying(false),
      });
      setIsTtsPlaying(true);
    }
  };

  // Capturar seleção de texto
  const handleMouseUpText = () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length >= 2) {
      setSelectedText(sel);
    } else {
      setSelectedText("");
    }
  };

  // Categorias disponíveis para filtro
  const categories = useMemo(() => {
    const set = new Set<string>();
    obras.forEach((o) => o.categoria && set.add(o.categoria));
    return Array.from(set);
  }, [obras]);

  // Filtragem estrita (apenas ativo=true e licença na allowlist)
  const filteredObras = useMemo(() => {
    return obras.filter((o) => {
      if (!o.ativo) return false;
      if (!LICENCAS_ALLOWLIST.includes(o.licenca)) return false;

      const matchesSearch =
        o.titulo.toLowerCase().includes(search.toLowerCase()) ||
        o.autor.toLowerCase().includes(search.toLowerCase()) ||
        o.sinopseOriginal.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === "all" || o.categoria === selectedCategory;
      const matchesLic = selectedLicenca === "all" || o.licenca === selectedLicenca;
      const matchesFav = !onlyFavorites || favorites.includes(o.id);

      return matchesSearch && matchesCat && matchesLic && matchesFav;
    });
  }, [obras, search, selectedCategory, selectedLicenca, onlyFavorites, favorites]);

  // Elegibilidade calculada em tempo real para o modal de cadastro
  const elegibilidadeCalculada = useMemo(() => {
    if (newLicenca !== "Domínio Público") return null;
    return calcularElegibilidadeDominioPublico(typeof newAnoMorte === "number" ? newAnoMorte : undefined);
  }, [newAnoMorte, newLicenca]);

  const handleCadastrarObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo.trim() || !newAutor.trim() || !newTextoCapitulo.trim()) return;

    if (newLicenca === "Domínio Público" && elegibilidadeCalculada && !elegibilidadeCalculada.elegivel) {
      alert("Atenção: Pelas regras da Lei 9.610/1998, autores falecidos há menos de 70 anos ainda possuem direitos reservados. Cadastre apenas se possuir outra licença permitida (CC BY, CC0).");
      return;
    }

    const novaObra: ObraBiblioteca = {
      id: `obra-${Date.now()}`,
      titulo: newTitulo.trim(),
      autor: newAutor.trim(),
      anoMorteAutor: typeof newAnoMorte === "number" ? newAnoMorte : undefined,
      idioma: i18n.language || "pt-BR",
      categoria: newCategoria.trim(),
      licenca: newLicenca,
      fonteNome: newFonteNome.trim(),
      fonteUrl: newFonteUrl.trim() || "http://www.dominiopublico.gov.br",
      atribuicao: newAtribuicao.trim() || "Cadastro auditado sob licença permitida no Brain Studio.",
      verificadoEm: new Date().toISOString().split("T")[0],
      sinopseOriginal: newSinopse.trim() || "Obra integrada ao acervo aberto.",
      ativo: true,
      capitulos: [
        {
          id: `cap-1`,
          numero: 1,
          titulo: "Capítulo I",
          conteudo: newTextoCapitulo.trim(),
        },
      ],
    };

    saveObrasState([novaObra, ...obras]);
    setShowAddModal(false);
    setNewTitulo("");
    setNewAutor("");
    setNewAnoMorte("");
    setNewTextoCapitulo("");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--app-text)]">
                {t("biblioteca.titulo", "Biblioteca Virtual Aberta")}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {t("biblioteca.selo_licenca", "100% Livre de Direitos")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              {t("biblioteca.subtitulo", "Obras canônicas em Domínio Público (70 anos pós-morte) e licenças Creative Commons (CC0, CC BY, CC BY-SA)")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-[var(--app-card-hover)] hover:bg-[var(--app-border)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[var(--app-primary)]" />
            {t("biblioteca.cadastrar_obra", "Cadastrar Obra")}
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[var(--app-card-hover)]/40 border border-[var(--app-border)] rounded-2xl px-3 py-2">
            <Search className="w-4 h-4 text-[var(--app-text-muted)] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("biblioteca.placeholder_busca", "Pesquisar por título, autor ou palavra-chave...")}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)] outline-none cursor-pointer"
            >
              <option value="all">{t("biblioteca.todas_categorias", "Todas as Categorias")}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Licença */}
            <select
              value={selectedLicenca}
              onChange={(e) => setSelectedLicenca(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)] outline-none cursor-pointer"
            >
              <option value="all">{t("biblioteca.todas_licencas", "Todas as Licenças")}</option>
              {LICENCAS_ALLOWLIST.map((lic) => (
                <option key={lic} value={lic}>{lic}</option>
              ))}
            </select>

            {/* Favoritos */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                onlyFavorites
                  ? "bg-amber-500 text-white"
                  : "bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {t("biblioteca.favoritos", "Favoritos")}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Books */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredObras.map((obra) => {
          const prog = readingProgress[obra.id];
          const isFav = favorites.includes(obra.id);
          const elegibilidade = obra.anoMorteAutor ? calcularElegibilidadeDominioPublico(obra.anoMorteAutor) : null;

          return (
            <div
              key={obra.id}
              className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Book Cover Banner */}
                <div className="relative h-40 w-full overflow-hidden bg-neutral-800">
                  <img
                    src={obra.capaUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"}
                    alt={obra.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                      {obra.licenca}
                    </span>
                    <button
                      onClick={() => toggleFavorite(obra.id)}
                      className={`p-2 rounded-full backdrop-blur-xs transition cursor-pointer ${
                        isFav ? "bg-amber-500 text-white" : "bg-black/40 text-white/80 hover:text-white"
                      }`}
                      aria-label={t("biblioteca.favoritar", "Favoritar")}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Author on Cover */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] font-semibold text-amber-300 block">{obra.categoria}</span>
                    <h3 className="text-base font-black leading-tight line-clamp-1">{obra.titulo}</h3>
                    <p className="text-xs text-neutral-300">{obra.autor}</p>
                  </div>
                </div>

                {/* Body: Sinopse & Licença info */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-[var(--app-text-muted)] line-clamp-3 leading-relaxed">
                    {obra.sinopseOriginal}
                  </p>

                  {/* Atribuição & 70 anos post-mortem */}
                  <div className="p-2.5 rounded-xl bg-[var(--app-card-hover)]/40 border border-[var(--app-border)] text-[11px] space-y-1 text-[var(--app-text-muted)]">
                    <div className="flex items-center justify-between">
                      <span>{t("biblioteca.fonte", "Fonte:")} <strong className="text-[var(--app-text)]">{obra.fonteNome}</strong></span>
                      {elegibilidade && elegibilidade.elegivel && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          ✓ Domínio Público (+{elegibilidade.anosDesdeInicio} anos)
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] line-clamp-1 italic">{obra.atribuicao}</p>
                  </div>

                  {/* Progresso de Leitura */}
                  {prog && prog.percent > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-[var(--app-text-muted)]">{t("biblioteca.progresso", "Progresso")}</span>
                        <span className="text-[var(--app-primary)]">{prog.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--app-border)] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-[var(--app-primary)] rounded-full transition-all duration-300"
                          style={{ width: `${prog.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 border-t border-[var(--app-border)]/50 mt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenReader(obra)}
                  className="flex-1 py-2 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold hover:opacity-90 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {prog ? t("biblioteca.continuar_lendo", "Continuar Lendo") : t("biblioteca.ler_obra", "Ler Obra")}
                </button>

                <button
                  onClick={() => handleReportLicense(obra.id)}
                  className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                  title={t("biblioteca.denunciar_licenca", "Denunciar problema de licença")}
                  aria-label={t("biblioteca.denunciar_licenca", "Denunciar licença")}
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leitor Interno Full Modal (Reader Mode) */}
      {activeReadingBook && (
        <div
          className={`fixed inset-0 z-50 flex flex-col transition-colors duration-200 animate-in fade-in ${
            readerTheme === "sepia"
              ? "bg-[#fcf8f2] text-[#2c221e]"
              : readerTheme === "dark"
              ? "bg-[#141210] text-[#ded3c8]"
              : "bg-white text-neutral-900"
          }`}
        >
          {/* Reader Top Bar */}
          <div
            className={`p-3 sm:p-4 border-b flex items-center justify-between gap-3 ${
              readerTheme === "sepia"
                ? "border-[#ebdccb] bg-[#f7efe3]"
                : readerTheme === "dark"
                ? "border-neutral-800 bg-[#1c1815]"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveReadingBook(null);
                  stopSpeaking();
                  setIsTtsPlaying(false);
                }}
                className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                aria-label={t("geral.voltar", "Voltar")}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-sm sm:text-base font-black line-clamp-1">{activeReadingBook.titulo}</h3>
                <p className="text-xs opacity-75">{activeReadingBook.autor} • {activeReadingBook.capitulos[activeChapterIndex]?.titulo}</p>
              </div>
            </div>

            {/* Reader Controls: Font Size, Theme, Font Family, TTS */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Leitura em Voz Alta (TTS) */}
              <button
                onClick={handleToggleTts}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isTtsPlaying ? "bg-amber-500 text-white animate-pulse" : "bg-black/5 dark:bg-white/10 hover:bg-black/10"
                }`}
                title={isTtsPlaying ? t("biblioteca.pausar_voz", "Pausar leitura em voz alta") : t("biblioteca.ouvir_capitulo", "Ouvir capítulo em voz alta")}
              >
                {isTtsPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isTtsPlaying ? t("biblioteca.pausar", "Pausar") : t("biblioteca.ouvir", "Ouvir")}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() =>
                  setReaderTheme((prev) => (prev === "sepia" ? "light" : prev === "light" ? "dark" : "sepia"))
                }
                className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 transition cursor-pointer"
                title={t("biblioteca.trocar_tema_leitor", "Mudar tema visual do leitor")}
              >
                {readerTheme === "sepia" ? <Coffee className="w-4 h-4 text-amber-700" /> : readerTheme === "dark" ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </button>

              {/* Font Size Toggle */}
              <button
                onClick={() =>
                  setReaderFontSize((prev) => (prev === "sm" ? "base" : prev === "base" ? "lg" : prev === "lg" ? "xl" : "sm"))
                }
                className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 transition cursor-pointer font-bold text-xs"
                title={t("biblioteca.tamanho_fonte", "Ajustar tamanho da fonte")}
              >
                <Type className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Body Text */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-10 max-w-3xl mx-auto w-full space-y-6"
            onMouseUp={handleMouseUpText}
          >
            <div className="border-b pb-4 opacity-75 text-xs flex items-center justify-between">
              <span>{activeReadingBook.capitulos[activeChapterIndex]?.titulo}</span>
              <span>{t("biblioteca.capitulo", "Capítulo")} {activeChapterIndex + 1} de {activeReadingBook.capitulos.length}</span>
            </div>

            <article
              className={`leading-relaxed whitespace-pre-line select-text ${
                readerFontSize === "sm"
                  ? "text-sm sm:text-base"
                  : readerFontSize === "base"
                  ? "text-base sm:text-lg"
                  : readerFontSize === "lg"
                  ? "text-lg sm:text-xl"
                  : "text-xl sm:text-2xl"
              } ${
                readerFontFamily === "serif"
                  ? "font-serif"
                  : readerFontFamily === "dyslexic"
                  ? "font-sans tracking-wide leading-loose"
                  : "font-sans"
              }`}
            >
              {activeReadingBook.capitulos[activeChapterIndex]?.conteudo}
            </article>

            {/* Floating Selection Toolbar for Lumina & Dictionary */}
            {selectedText && (
              <div className="sticky bottom-6 left-1/2 -translate-x-1/2 bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] rounded-2xl shadow-2xl p-2 flex items-center gap-1.5 z-40 max-w-sm animate-in zoom-in-95">
                <button
                  onClick={() => {
                    if (onOpenSocraticWithContext) {
                      onOpenSocraticWithContext(
                        selectedText,
                        `Trecho da obra "${activeReadingBook.titulo}" (${activeReadingBook.autor}):\n"${selectedText}"`
                      );
                      setActiveReadingBook(null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:opacity-90 transition cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5" />
                  {t("biblioteca.explicar_lumina", "Explicar com a Lumina")}
                </button>

                <button
                  onClick={() => {
                    setDictionaryWord(selectedText.split(" ")[0].replace(/[^a-zA-ZÀ-ÿ]/g, ""));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--app-card-hover)] hover:bg-[var(--app-border)] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  {t("biblioteca.dicionario", "Dicionário")}
                </button>

                {onCreateFlashcard && (
                  <button
                    onClick={() => {
                      onCreateFlashcard(
                        `Contexto de ${activeReadingBook.titulo}`,
                        `Explicação do trecho:\n"${selectedText}"`
                      );
                      setSelectedText("");
                    }}
                    className="px-2.5 py-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold transition cursor-pointer"
                    title={t("biblioteca.gerar_flashcard", "Gerar flashcard")}
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedText("")}
                  className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[var(--app-text-muted)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Reader Footer Navigation */}
          <div
            className={`p-3 sm:p-4 border-t flex items-center justify-between ${
              readerTheme === "sepia"
                ? "border-[#ebdccb] bg-[#f7efe3]"
                : readerTheme === "dark"
                ? "border-neutral-800 bg-[#1c1815]"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <button
              disabled={activeChapterIndex === 0}
              onClick={() => handleUpdateChapter(activeChapterIndex - 1)}
              className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("biblioteca.capitulo_anterior", "Capítulo Anterior")}
            </button>

            <span className="text-xs opacity-75 font-semibold">
              +15 XP {t("biblioteca.xp_por_capitulo", "ao concluir a leitura")}
            </span>

            <button
              disabled={activeChapterIndex + 1 >= activeReadingBook.capitulos.length}
              onClick={() => handleUpdateChapter(activeChapterIndex + 1)}
              className="px-4 py-2 rounded-xl bg-[var(--app-primary)] text-white hover:opacity-90 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {t("biblioteca.proximo_capitulo", "Próximo Capítulo")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Obra */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-[var(--app-text)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--app-primary)]" />
                <h3 className="text-base font-black">{t("biblioteca.cadastrar_titulo", "Cadastrar Nova Obra no Acervo")}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarObra} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--app-text)] block mb-1">Título da Obra *</label>
                  <input
                    type="text"
                    required
                    value={newTitulo}
                    onChange={(e) => setNewTitulo(e.target.value)}
                    placeholder="Ex: Dom Casmurro"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--app-text)] block mb-1">Autor(a) *</label>
                  <input
                    type="text"
                    required
                    value={newAutor}
                    onChange={(e) => setNewAutor(e.target.value)}
                    placeholder="Ex: Machado de Assis"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[var(--app-text)] block mb-1">Ano Falecimento Autor</label>
                  <input
                    type="number"
                    value={newAnoMorte}
                    onChange={(e) => setNewAnoMorte(e.target.value ? parseInt(e.target.value) : "")}
                    placeholder="Ex: 1908"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--app-text)] block mb-1">Licença Permitida *</label>
                  <select
                    value={newLicenca}
                    onChange={(e) => setNewLicenca(e.target.value as LicencaObra)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none"
                  >
                    {LICENCAS_ALLOWLIST.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[var(--app-text)] block mb-1">Categoria</label>
                  <input
                    type="text"
                    value={newCategoria}
                    onChange={(e) => setNewCategoria(e.target.value)}
                    placeholder="Ex: Literatura Brasileira"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none"
                  />
                </div>
              </div>

              {/* Auditoria Automática de Domínio Público */}
              {elegibilidadeCalculada && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    elegibilidadeCalculada.elegivel
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  <span className="font-bold block">
                    {elegibilidadeCalculada.elegivel ? "✓ Elegível em Domínio Público no Brasil" : "⚠️ Atenção: Autor falecido há menos de 70 anos"}
                  </span>
                  <p>
                    {elegibilidadeCalculada.elegivel
                      ? `Entrou em domínio público em ${elegibilidadeCalculada.anoEntradaDominioPublico} (${elegibilidadeCalculada.anosDesdeInicio} anos decorridos pela Lei 9.610/1998).`
                      : `A obra só entrará em domínio público no Brasil a partir de 1º de janeiro de ${elegibilidadeCalculada.anoEntradaDominioPublico}.`}
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-[var(--app-text)] block mb-1">Fonte / Repositório Oficial</label>
                <input
                  type="text"
                  value={newFonteNome}
                  onChange={(e) => setNewFonteNome(e.target.value)}
                  placeholder="Ex: Portal Domínio Público MEC, Project Gutenberg, SciELO"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--app-text)] block mb-1">Sinopse Breve</label>
                <textarea
                  rows={2}
                  value={newSinopse}
                  onChange={(e) => setNewSinopse(e.target.value)}
                  placeholder="Resumo fiel da obra..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--app-text)] block mb-1">Texto do Primeiro Capítulo *</label>
                <textarea
                  rows={4}
                  required
                  value={newTextoCapitulo}
                  onChange={(e) => setNewTextoCapitulo(e.target.value)}
                  placeholder="Cole aqui o texto do capítulo inicial..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-[var(--app-card-hover)] font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--app-primary)] text-white font-bold shadow hover:opacity-90 transition cursor-pointer"
                >
                  Salvar Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Sheet Dicionário caso o aluno clique em uma palavra no leitor */}
      {dictionaryWord && (
        <DictionaryBottomSheet
          word={dictionaryWord}
          onClose={() => setDictionaryWord(null)}
          onAskLumina={(word) => {
            if (onOpenSocraticWithContext) {
              onOpenSocraticWithContext(word);
              setActiveReadingBook(null);
            }
          }}
          onCreateFlashcard={onCreateFlashcard}
          onRewardXp={onRewardXp}
        />
      )}
    </div>
  );
};

export default LibraryTab;
