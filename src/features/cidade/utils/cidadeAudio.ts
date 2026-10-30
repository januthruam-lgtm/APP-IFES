/**
 * APP-IFES - Efeitos Sonoros Sintetizados da Construção de Cidades (Web Audio API)
 * Efeitos autênticos de obras de vilas: marteladas com impacto na estrutura,
 * serrote cortando madeira, poeira/faíscas e arpejo celestial ao concluir estágios.
 * 100% offline, sintetizado no navegador, zero latência, sem arquivos de áudio externos.
 */

let audioCtx: AudioContext | null = null;
let audioHabilitado = true;

export function alternarAudioCidade(): boolean {
  audioHabilitado = !audioHabilitado;
  return audioHabilitado;
}

export function isAudioHabilitado(): boolean {
  return audioHabilitado;
}

function getAudioContext(): AudioContext | null {
  if (!audioHabilitado || typeof window === "undefined") return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Toca sequência rítmica de ferramentas de construção durante a obra:
 * 1. Raspagem rítmica do serrote na madeira (0.0s - 0.35s)
 * 2. Golpe inicial de martelo na madeira (0.35s)
 * 3. Segundo golpe firme de martelo (0.70s)
 * 4. Golpe final de bigorna/ferro com reverberação metálica (1.05s)
 * 5. Chime brilhante de estrelas e conclusão (1.25s)
 */
export function tocarSomConstruir(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Som de Serrote cortando madeira (ruído filtrado modulado)
  try {
    const bufferSize = ctx.sampleRate * 0.32;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Onda de atrito dente-de-serra simulando lâmina
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI * 8);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.16);
    filter.frequency.linearRampToValueAtTime(700, now + 0.32);
    filter.Q.value = 3.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.35);
  } catch {}

  // 2. Três batidas rítmicas de martelo (Madeira -> Madeira -> Metal/Bigorna)
  const marteladas = [
    { t: 0.35, freq: 190, decay: 0.12, gain: 0.22, metal: false },
    { t: 0.70, freq: 220, decay: 0.12, gain: 0.26, metal: false },
    { t: 1.05, freq: 290, decay: 0.22, gain: 0.32, metal: true },
  ];

  marteladas.forEach(({ t, freq, decay, gain, metal }) => {
    const tStart = now + t;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = metal ? "square" : "triangle";
    osc.frequency.setValueAtTime(freq, tStart);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, tStart + decay);

    g.gain.setValueAtTime(gain, tStart);
    g.gain.exponentialRampToValueAtTime(0.001, tStart + decay);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(tStart);
    osc.stop(tStart + decay + 0.05);

    // Se for o golpe final, acrescenta ressonância de bigorna/aço
    if (metal) {
      const oscMetal = ctx.createOscillator();
      const gMetal = ctx.createGain();
      oscMetal.type = "sine";
      oscMetal.frequency.setValueAtTime(1320, tStart);
      oscMetal.frequency.exponentialRampToValueAtTime(880, tStart + 0.35);

      gMetal.gain.setValueAtTime(0.16, tStart);
      gMetal.gain.exponentialRampToValueAtTime(0.001, tStart + 0.38);

      oscMetal.connect(gMetal);
      gMetal.connect(ctx.destination);
      oscMetal.start(tStart);
      oscMetal.stop(tStart + 0.4);
    }
  });

  // 3. Chime Triunfante ao Concluir a Obra (Arpejo Dourado: C5 -> E5 -> G5 -> C6)
  const notasChime = [523.25, 659.25, 783.99, 1046.5];
  notasChime.forEach((freq, idx) => {
    const tNota = now + 1.25 + idx * 0.06;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, tNota);

    g.gain.setValueAtTime(0.15, tNota);
    g.gain.exponentialRampToValueAtTime(0.001, tNota + 0.35);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(tNota);
    osc.stop(tNota + 0.4);
  });
}

/**
 * Som de Vitória ao Completar Todas as 5 Obras da Vila
 */
export function tocarSomCompletarCidade(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const fanfarra = [
    { freq: 440.0, t: 0.0, d: 0.18 }, // A4
    { freq: 554.37, t: 0.15, d: 0.18 }, // C#5
    { freq: 659.25, t: 0.30, d: 0.18 }, // E5
    { freq: 880.0, t: 0.45, d: 0.45 }, // A5
    { freq: 1108.73, t: 0.70, d: 0.65 }, // C#6
  ];

  fanfarra.forEach(({ freq, t, d }) => {
    const tStart = now + t;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, tStart);

    ganho.gain.setValueAtTime(0.24, tStart);
    ganho.gain.exponentialRampToValueAtTime(0.001, tStart + d);

    osc.connect(ganho);
    ganho.connect(ctx.destination);
    osc.start(tStart);
    osc.stop(tStart + d + 0.05);
  });
}

/**
 * Som de Moedas caindo / recompensa
 */
export function tocarSomMoedas(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [1200, 1600, 2000].forEach((freq, idx) => {
    const tNota = now + idx * 0.05;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, tNota);

    g.gain.setValueAtTime(0.12, tNota);
    g.gain.exponentialRampToValueAtTime(0.001, tNota + 0.18);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(tNota);
    osc.stop(tNota + 0.2);
  });
}

/**
 * Som suave de clique ou foco
 */
export function tocarSomClique(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.exponentialRampToValueAtTime(240, now + 0.06);

  g.gain.setValueAtTime(0.08, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}
