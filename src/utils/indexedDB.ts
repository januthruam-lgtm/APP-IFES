import { CourseTrack } from "../types";

export interface CacheStats {
  decksCount: number;
  cardsCount: number;
  tracksCount: number;
  modulesCount: number;
  flashcardsCount: number;
  lastUpdated: string;
  lastSync: string;
  isAvailableOffline: boolean;
}

const CACHE_TRACKS_KEY = "brain_studio_cached_tracks";
const CACHE_PROGRESS_KEY = "brain_studio_cached_progress";
const CACHE_STATS_KEY = "brain_studio_cache_stats";

export async function seedDefaultOfflineCache(tracks?: any): Promise<void> {
  try {
    const stats: CacheStats = {
      decksCount: 4,
      cardsCount: 48,
      tracksCount: Array.isArray(tracks) ? tracks.length : 3,
      modulesCount: 12,
      flashcardsCount: 48,
      lastUpdated: new Date().toLocaleDateString("pt-BR"),
      lastSync: new Date().toISOString(),
      isAvailableOffline: true,
    };
    localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("seedDefaultOfflineCache error:", e);
  }
}

export async function cacheStudyTracks(tracks: CourseTrack[]): Promise<void> {
  try {
    localStorage.setItem(CACHE_TRACKS_KEY, JSON.stringify(tracks));
    const stats = await getOfflineCacheStats();
    stats.tracksCount = tracks.length;
    stats.lastUpdated = new Date().toLocaleDateString("pt-BR");
    stats.lastSync = new Date().toISOString();
    localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("cacheStudyTracks error:", e);
  }
}

export async function saveOfflineModuleProgress(modId: number, progress: any, courseTitle?: string): Promise<void> {
  try {
    const saved = localStorage.getItem(CACHE_PROGRESS_KEY);
    const map = saved ? JSON.parse(saved) : {};
    map[modId] = { progress, courseTitle, timestamp: Date.now() };
    localStorage.setItem(CACHE_PROGRESS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("saveOfflineModuleProgress error:", e);
  }
}

export async function clearOfflineCache(): Promise<void> {
  try {
    localStorage.removeItem(CACHE_TRACKS_KEY);
    localStorage.removeItem(CACHE_PROGRESS_KEY);
    const stats: CacheStats = {
      decksCount: 0,
      cardsCount: 0,
      tracksCount: 0,
      modulesCount: 0,
      flashcardsCount: 0,
      lastUpdated: "Nunca",
      lastSync: new Date().toISOString(),
      isAvailableOffline: false,
    };
    localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("clearOfflineCache error:", e);
  }
}

export async function getOfflineCacheStats(): Promise<CacheStats> {
  try {
    const saved = localStorage.getItem(CACHE_STATS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("getOfflineCacheStats error:", e);
  }
  return {
    decksCount: 4,
    cardsCount: 48,
    tracksCount: 2,
    modulesCount: 12,
    flashcardsCount: 48,
    lastUpdated: new Date().toLocaleDateString("pt-BR"),
    lastSync: new Date().toISOString(),
    isAvailableOffline: true,
  };
}

export async function getCachedDecks(): Promise<any[]> {
  return [
    { id: "deck-alg-1", title: "Algoritmos e Estruturas de Dados", count: 12, cardsCount: 12, icon: "💻", subjectName: "Algoritmos" },
    { id: "deck-calc-1", title: "Cálculo Diferencial e Integral", count: 14, cardsCount: 14, icon: "📐", subjectName: "Cálculo I" },
    { id: "deck-redes-1", title: "Redes de Computadores", count: 10, cardsCount: 10, icon: "🌐", subjectName: "Redes" },
    { id: "deck-bd-1", title: "Modelagem e Bancos de Dados SQL", count: 12, cardsCount: 12, icon: "🗄️", subjectName: "Banco de Dados" },
  ];
}
