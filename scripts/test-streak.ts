import {
  recordStudyActivity,
  calculateStreakOnRead,
  daysBetween,
} from "../src/utils/streakCalculator";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSOU: ${msg}`);
}

console.log("\n🧪 Testando Regras de Ofensiva (Streak):");

// Teste 1: Primeira atividade da história
const initial = recordStudyActivity(
  { lastActiveDate: null, currentStreak: 0, longestStreak: 0 },
  "2026-03-10"
);
assert(initial.currentStreak === 1, "Primeira atividade inicia em 1");
assert(initial.longestStreak === 1, "Maior ofensiva inicial é 1");

// Teste 2: Mais de uma atividade no mesmo dia (não deve mudar)
const sameDay = recordStudyActivity(initial, "2026-03-10");
assert(sameDay.currentStreak === 1, "Mesmo dia não incrementa streak (mantém 1)");

// Teste 3: Dia seguinte consecutivo (soma 1)
const nextDay = recordStudyActivity(sameDay, "2026-03-11");
assert(nextDay.currentStreak === 2, "Dia seguinte consecutivo incrementa para 2");
assert(nextDay.longestStreak === 2, "Maior ofensiva atualiza para 2");

// Teste 4: Virada de mês (31 de Março -> 01 de Abril)
const march31 = { lastActiveDate: "2026-03-31", currentStreak: 5, longestStreak: 5 };
const april01 = recordStudyActivity(march31, "2026-04-01");
assert(april01.currentStreak === 6, "Virada de mês 31/03 -> 01/04 incrementa de 5 para 6");

// Teste 5: Virada de ano (31 de Dezembro -> 01 de Janeiro)
const dec31 = { lastActiveDate: "2026-12-31", currentStreak: 12, longestStreak: 12 };
const jan01 = recordStudyActivity(dec31, "2027-01-01");
assert(jan01.currentStreak === 13, "Virada de ano 31/12 -> 01/01 incrementa de 12 para 13");

// Teste 6: Pulo de 2 dias sem atividade (zera e recomeça em 1)
const jumped2Days = recordStudyActivity(
  { lastActiveDate: "2026-03-10", currentStreak: 4, longestStreak: 10 },
  "2026-03-12"
);
assert(jumped2Days.currentStreak === 1, "Pulo de 2 dias zera e recomeça em 1");
assert(jumped2Days.longestStreak === 10, "Maior ofensiva histórica de 10 é preservada");

// Teste 7: Pulo de 5 dias (zera e recomeça em 1)
const jumped5Days = recordStudyActivity(
  { lastActiveDate: "2026-03-10", currentStreak: 4, longestStreak: 10 },
  "2026-03-15"
);
assert(jumped5Days.currentStreak === 1, "Pulo de 5 dias zera e recomeça em 1");

// Teste 8: Cálculo no momento da leitura (passaram 2+ dias sem atividade)
const readYesterday = calculateStreakOnRead("2026-03-14", 5, "2026-03-15");
assert(readYesterday === 5, "Leitura de ontem mantém a ofensiva ativa de 5");

const readToday = calculateStreakOnRead("2026-03-15", 5, "2026-03-15");
assert(readToday === 5, "Leitura do mesmo dia mantém a ofensiva de 5");

const readLate = calculateStreakOnRead("2026-03-10", 5, "2026-03-13");
assert(readLate === 0, "Leitura após 3 dias sem estudo retorna 0 no dashboard");

// Teste 9: Correção do bug de 15 dias sem histórico de 15 dias
import { sanitizeUserStreak } from "../src/utils/streakCalculator";
const buggedUser = {
  streakDays: 15,
  lastActiveDate: "2026-03-15",
  streakHistory: [{ date: "2026-03-15", activitiesCount: 1 }],
};
const sanitized = sanitizeUserStreak(buggedUser, "2026-03-15");
assert(sanitized === 1, "Usuário com 15 dias em mock/cache sem 15 dias reais é corrigido para 1 dia");

console.log("\n🎉 Todos os testes de ofensiva passaram com 100% de sucesso!\n");
