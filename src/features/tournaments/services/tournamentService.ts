import { LeagueTier, TournamentLeaderboardEntry } from "../types";
import { db } from "../../../lib/firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

const DEMO_STUDENT_ENTRIES: TournamentLeaderboardEntry[] = [
  {
    rank: 1,
    uid: "aluno_vitoria_01",
    name: "Gabriel Vasconcelos",
    avatar: "🧑‍🔬",
    matricula: "20231TI0045",
    campus: "Campus Vitória",
    points: 1840,
    league: "ouro",
    changeDirection: "up",
  },
  {
    rank: 2,
    uid: "aluna_serra_02",
    name: "Camila Ribeiro",
    avatar: "👩‍💻",
    matricula: "20222SI0012",
    campus: "Campus Serra",
    points: 1620,
    league: "ouro",
    changeDirection: "same",
  },
  {
    rank: 3,
    uid: "aluno_vila_velha_03",
    name: "Felipe Meneghel",
    avatar: "👨‍🏫",
    matricula: "20231QU0089",
    campus: "Campus Vila Velha",
    points: 1450,
    league: "ouro",
    changeDirection: "up",
  },
  {
    rank: 4,
    uid: "local_user",
    name: "Você (Estudante IFES)",
    avatar: "🎓",
    matricula: "20241TI0123",
    campus: "Campus Vitória",
    points: 1240,
    league: "prata",
    changeDirection: "up",
  },
  {
    rank: 5,
    uid: "aluna_colatina_05",
    name: "Juliana Duarte",
    avatar: "👩‍🎨",
    matricula: "20231AR0033",
    campus: "Campus Colatina",
    points: 1110,
    league: "prata",
    changeDirection: "down",
  },
  {
    rank: 6,
    uid: "aluno_cachoeiro_06",
    name: "Lucas Alvarenga",
    avatar: "🧑‍🔧",
    matricula: "20221MC0071",
    campus: "Campus Cachoeiro",
    points: 980,
    league: "prata",
    changeDirection: "same",
  },
  {
    rank: 7,
    uid: "aluna_aracruz_07",
    name: "Mariana Prado",
    avatar: "👩‍🌾",
    matricula: "20232EA0019",
    campus: "Campus Aracruz",
    points: 870,
    league: "bronze",
    changeDirection: "up",
  },
  {
    rank: 8,
    uid: "aluno_linhares_08",
    name: "Rodrigo Fontana",
    avatar: "🧑‍💻",
    matricula: "20231AD0055",
    campus: "Campus Linhares",
    points: 760,
    league: "bronze",
    changeDirection: "down",
  },
];

export async function fetchTournamentLeaderboard(
  tournamentId: string
): Promise<TournamentLeaderboardEntry[]> {
  try {
    const raw = localStorage.getItem(`tournament_lb_${tournamentId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  if (db) {
    try {
      const snap = await getDocs(collection(db, "torneios", tournamentId, "participantes"));
      const entries: TournamentLeaderboardEntry[] = [];
      snap.forEach((d) => entries.push(d.data() as TournamentLeaderboardEntry));
      if (entries.length > 0) {
        entries.sort((a, b) => b.points - a.points);
        entries.forEach((e, i) => (e.rank = i + 1));
        return entries;
      }
    } catch (e) {
      console.warn("Erro ao ler leaderboard do Firestore:", e);
    }
  }

  return DEMO_STUDENT_ENTRIES;
}

export function saveTournamentLeaderboard(
  tournamentId: string,
  entries: TournamentLeaderboardEntry[]
): void {
  try {
    localStorage.setItem(`tournament_lb_${tournamentId}`, JSON.stringify(entries));
  } catch {}
}
