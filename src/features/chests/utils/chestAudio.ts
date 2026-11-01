// Synthesizer de efeitos sonoros procedural com Web Audio API para abertura de baús e revelação de cartas
// Totalmente autônomo, sem requisições externas de rede, garantindo 100% de confiabilidade no mobile e desktop.

import { ChestType } from "../types";
import { CardRarity } from "../../cards/types";

let audioCtx: AudioContext | null = null;
const STORAGE_SOUND_KEY = "brain_studio_chest_audio_enabled";

export function isAudioEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_SOUND_KEY);
    return val !== "false";
  } catch {
    return true;
  }
}

export function setAudioEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_SOUND_KEY, enabled ? "true" : "false");
  } catch {}
}

function getAudioContext(): AudioContext | null {
  if (!isAudioEnabled()) return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Tique/toque suave no baú antes de abrir
 */
export function playChestTap(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch {}
}

/**
 * Som de tremor mecânico/tensão antes do estalo
 */
export function playChestRumble(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.6);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.linearRampToValueAtTime(450, now + 0.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.66);
  } catch {}
}

/**
 * Explosão triunfal de abertura do baú, proporcional à raridade da caixa
 */
export function playChestOpen(tier: ChestType): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;

    // Frequências base de acorde de acordo com a categoria
    const chordsMap: Record<ChestType, number[]> = {
      madeira: [261.63, 329.63, 392.0], // C maior simples
      prata: [329.63, 392.0, 493.88, 659.25], // E menor cintilante
      ouro: [392.0, 493.88, 587.33, 783.99], // G maior nobre
      epico: [440.0, 554.37, 659.25, 880.0], // A maior místico
      lendario: [523.25, 659.25, 783.99, 1046.5, 1318.51], // C pentatônico celestial
      mitico: [587.33, 739.99, 880.0, 1174.66, 1479.98, 1760.0], // D maior cósmico expandido
    };

    const notes = chordsMap[tier] || chordsMap.madeira;

    // Sub-bass thud (impacto da tampa abrindo)
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = "sine";
    impactOsc.frequency.setValueAtTime(130, now);
    impactOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    impactGain.gain.setValueAtTime(0.4, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    impactOsc.connect(impactGain);
    impactGain.connect(ctx.destination);
    impactOsc.start(now);
    impactOsc.stop(now + 0.36);

    // Arpeggio de sino celestial
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.05;

      osc.type = tier === "mitico" || tier === "lendario" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8 + idx * 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.9 + idx * 0.1);
    });
  } catch {}
}

/**
 * Som de moedas tilintando (efeito cascata metálico)
 */
export function playCoinTinkle(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const freqs = [1046.5, 1318.51, 1567.98, 2093.0, 2637.02, 3135.96];

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + idx * 0.04;

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, st);

      gain.gain.setValueAtTime(0.15, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + 0.18);
    });
  } catch {}
}

/**
 * Swoosh de experiência (XP) ascendente
 */
export function playXpWhoosh(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  } catch {}
}

/**
 * Cintilação cristalina de Fragmentos Estelares
 */
export function playShardSparkle(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const freqs = [1760.0, 2217.46, 2637.02, 3520.0];

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + idx * 0.05;

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, st);

      gain.gain.setValueAtTime(0.12, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + 0.26);
    });
  } catch {}
}

/**
 * Som de virada de carta revelada, escalonado pela raridade
 */
export function playCardFlip(rarity: CardRarity, isGolden?: boolean): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;

    // Som de passagem/vento
    const swooshOsc = ctx.createOscillator();
    const swooshGain = ctx.createGain();
    swooshOsc.type = "sine";
    swooshOsc.frequency.setValueAtTime(400, now);
    swooshOsc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    swooshGain.gain.setValueAtTime(0.15, now);
    swooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    swooshOsc.connect(swooshGain);
    swooshGain.connect(ctx.destination);
    swooshOsc.start(now);
    swooshOsc.stop(now + 0.16);

    // Acorde de impacto por raridade
    const rarityChords: Record<CardRarity, number[]> = {
      comum: [440.0, 554.37],
      rara: [523.25, 659.25, 783.99],
      epica: [587.33, 739.99, 880.0, 1174.66],
      lendaria: [659.25, 830.61, 987.77, 1318.51, 1661.22],
      mitica: [783.99, 987.77, 1174.66, 1567.98, 1975.53, 2349.32],
    };

    const notes = rarityChords[rarity] || rarityChords.comum;
    const delayBase = 0.08;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + delayBase + idx * 0.04;

      osc.type = rarity === "lendaria" || rarity === "mitica" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, st);

      const maxVol = rarity === "comum" ? 0.12 : 0.2;
      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(maxVol, st + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.5 + idx * 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + 0.6 + idx * 0.05);
    });

    // Se for carta Dourada, adiciona harmônico de brilho resplandecente
    if (isGolden) {
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      const st = now + 0.2;

      shimmerOsc.type = "sine";
      shimmerOsc.frequency.setValueAtTime(2637.02, st);
      shimmerOsc.frequency.linearRampToValueAtTime(3520.0, st + 0.35);

      shimmerGain.gain.setValueAtTime(0.001, st);
      shimmerGain.gain.linearRampToValueAtTime(0.15, st + 0.08);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, st + 0.45);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);

      shimmerOsc.start(st);
      shimmerOsc.stop(st + 0.46);
    }
  } catch {}
}

/**
 * Pequeno clarim de celebração quando uma carta é NOVA na coleção
 */
export function playNewCardFanfare(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const fanfareNotes = [
      { f: 523.25, t: 0.0, d: 0.1 }, // C5
      { f: 659.25, t: 0.1, d: 0.1 }, // E5
      { f: 783.99, t: 0.2, d: 0.12 }, // G5
      { f: 1046.5, t: 0.32, d: 0.35 }, // C6 prolongado
    ];

    fanfareNotes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + item.t;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(item.f, st);

      gain.gain.setValueAtTime(0.01, st);
      gain.gain.linearRampToValueAtTime(0.18, st + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, st + item.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + item.d + 0.02);
    });
  } catch {}
}

/**
 * Fanfarra final no resumo geral com todas as recompensas
 */
export function playSummaryFanfare(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + idx * 0.07;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.01, st);
      gain.gain.linearRampToValueAtTime(0.16, st + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + 0.75);
    });
  } catch {}
}
