// Cálculo Preciso de Ofensiva (Streak) baseado em Atividades Reais de Estudo
// Fuso horário estrito: America/Sao_Paulo (AAAA-MM-DD)

export interface StreakData {
  lastActiveDate: string | null;
  currentStreak: number;
  longestStreak: number;
}

/**
 * Retorna a data no formato AAAA-MM-DD no fuso horário America/Sao_Paulo
 */
export function getSaoPauloDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Converte string AAAA-MM-DD para objeto Date UTC em meia-noite para cálculo de diferença em dias
 */
export function parseDateOnly(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/**
 * Calcula a diferença em dias corridos entre duas datas no formato AAAA-MM-DD
 */
export function daysBetween(dateStrA: string, dateStrB: string): number {
  const msA = parseDateOnly(dateStrA);
  const msB = parseDateOnly(dateStrB);
  const diffMs = msB - msA;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calcula a ofensiva efetiva no momento da leitura.
 * Se passaram 2 ou mais dias sem atividade real de estudo, a ofensiva corrente é 0.
 */
export function calculateStreakOnRead(
  lastActiveDate: string | null | undefined,
  currentStreak: number,
  todayStr: string = getSaoPauloDateString()
): number {
  if (!lastActiveDate || currentStreak <= 0) {
    return 0;
  }

  const diff = daysBetween(lastActiveDate, todayStr);

  // Atividade foi hoje (diff == 0) ou ontem (diff == 1): ofensiva mantida
  if (diff === 0 || diff === 1) {
    return currentStreak;
  }

  // Passaram 2 ou mais dias sem atividade: ofensiva zerada
  return 0;
}

/**
 * Registra uma atividade real de estudo (simulado, flashcards, módulo lido, conversa Lumina).
 * Regras:
 * - Mesma data: não altera a contagem (no máximo 1 incremento por dia).
 * - Dia consecutivo (ontem): soma 1 dia à ofensiva.
 * - 2 ou mais dias (ou primeira vez): reinicia em 1.
 */
export function recordStudyActivity(
  prev: StreakData,
  todayStr: string = getSaoPauloDateString()
): StreakData {
  const currentEffectiveStreak = calculateStreakOnRead(prev.lastActiveDate, prev.currentStreak, todayStr);

  if (!prev.lastActiveDate) {
    return {
      lastActiveDate: todayStr,
      currentStreak: 1,
      longestStreak: Math.max(1, prev.longestStreak || 1),
    };
  }

  const diff = daysBetween(prev.lastActiveDate, todayStr);

  if (diff === 0) {
    // Mesma data: nenhuma alteração na contagem
    return {
      ...prev,
      currentStreak: currentEffectiveStreak > 0 ? currentEffectiveStreak : 1,
    };
  }

  if (diff === 1) {
    // Dia seguinte consecutivo: incrementa
    const nextStreak = currentEffectiveStreak + 1;
    return {
      lastActiveDate: todayStr,
      currentStreak: nextStreak,
      longestStreak: Math.max(nextStreak, prev.longestStreak || 0),
    };
  }

  // Pulo de 2 ou mais dias: recomeça em 1
  return {
    lastActiveDate: todayStr,
    currentStreak: 1,
    longestStreak: Math.max(1, prev.longestStreak || 0),
  };
}

/**
 * Valida e recalcula a ofensiva com base no histórico real de atividades e na última data ativa.
 * Corrige contagens incorretas herdadas de mock/versões antigas (ex.: 15 dias sem 15 dias reais consecutivos).
 */
export function sanitizeUserStreak(
  user: {
    streakDays?: number;
    lastActiveDate?: string | null;
    streakHistory?: Array<{ date: string; activitiesCount?: number }> | null;
  },
  todayStr: string = getSaoPauloDateString()
): number {
  const history = user.streakHistory || [];
  const validDates = new Set<string>();

  history.forEach((h) => {
    if (h && h.date) {
      validDates.add(h.date.slice(0, 10));
    }
  });

  const lastDate = user.lastActiveDate ? user.lastActiveDate.slice(0, 10) : "";
  if (lastDate) {
    validDates.add(lastDate);
  }

  if (validDates.size === 0) {
    return 1;
  }

  const sortedDates = Array.from(validDates).sort().reverse();
  const mostRecent = sortedDates[0];
  const diffFromToday = daysBetween(mostRecent, todayStr);

  // Se passou 2 ou mais dias sem atividade, ofensiva zerada
  if (diffFromToday > 1) {
    return 0;
  }

  // Contagem estrita de dias consecutivos
  let realConsecutive = 1;
  let cursor = mostRecent;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = sortedDates[i];
    const diff = daysBetween(prev, cursor);
    if (diff === 1) {
      realConsecutive++;
      cursor = prev;
    } else if (diff > 1) {
      break;
    }
  }

  // Se o usuário tiver um streak artificialmente alto (ex: 15 dias quando tem 1 ou poucos dias de histórico real)
  if (typeof user.streakDays === "number") {
    if (user.streakDays >= 14 && realConsecutive < 14) {
      return realConsecutive;
    }
    return Math.min(Math.max(1, user.streakDays), realConsecutive);
  }

  return realConsecutive;
}

/**
 * Migração única da ofensiva incorreta (ex: 15 dias hardcoded)
 */
export function applyStreakMigration(
  userId: string,
  currentStreakDays: number
): { effectiveStreak: number; showNotice: boolean } {
  if (typeof window === "undefined") {
    return { effectiveStreak: currentStreakDays, showNotice: false };
  }

  const migrationKey = `brain_studio_streak_migrated_${userId}`;
  const alreadyMigrated = localStorage.getItem(migrationKey) === "true";

  if (!alreadyMigrated) {
    localStorage.setItem(migrationKey, "true");
    return {
      effectiveStreak: currentStreakDays >= 14 ? 1 : currentStreakDays,
      showNotice: true,
    };
  }

  return {
    effectiveStreak: currentStreakDays,
    showNotice: false,
  };
}
