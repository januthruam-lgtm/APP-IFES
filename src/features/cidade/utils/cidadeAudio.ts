/**
 * Brain Studio - Efeitos Sonoros Sintetizados da Cidade do Conhecimento (Web Audio API)
 * Efeito rítmico de 3 marteladas com bigorna metálica e chime de estrelas para evolução de obras.
 * 100% offline, zero latência, sem arquivos de áudio externos.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
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
 * Toca sequência rítmica de 3 marteladas com golpe final de bigorna e arpejo de estrela.
 */
export function tocarSomConstruir(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Três batidas rítmicas de ferramenta de construção (0.0s, 0.28s, 0.58s)
  const marteladas = [
    { t: 0.0, freq: 150, decayFreq: 50, gain: 0.22, metal: false },
    { t: 0.28, freq: 175, decayFreq: 60, gain: 0.25, metal: false },
    { t: 0.58, freq: 240, decayFreq: 80, gain: 0.32, metal: true },
  ];

  marteladas.forEach(({ t, freq, decayFreq, gain, metal }) => {
    const tStart = now + t;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = metal ? "square" : "triangle";
    osc.frequency.setValueAtTime(freq, tStart);
    osc.frequency.exponentialRampToValueAtTime(decayFreq, tStart + 0.12);

    g.gain.setValueAtTime(gain, tStart);
    g.gain.exponentialRampToValueAtTime(0.001, tStart + (metal ? 0.2 : 0.14));

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(tStart);
    osc.stop(tStart + 0.22);

    // Se for o golpe final de metal, adiciona ressonância de bigorna
    if (metal) {
      const oscMetal = ctx.createOscillator();
      const gMetal = ctx.createGain();
      oscMetal.type = "sine";
      oscMetal.frequency.setValueAtTime(1240, tStart);
      oscMetal.frequency.exponentialRampToValueAtTime(780, tStart + 0.35);

      gMetal.gain.setValueAtTime(0.18, tStart);
      gMetal.gain.exponentialRampToValueAtTime(0.001, tStart + 0.4);

      oscMetal.connect(gMetal);
      gMetal.connect(ctx.destination);
      oscMetal.start(tStart);
      oscMetal.stop(tStart + 0.42);
    }
  });

  // Chime triunfante de conclusão da obra (arpejo reluzente E5 -> G#5 -> B5 -> E6)
  const notasChime = [659.25, 830.61, 987.77, 1318.51];
  notasChime.forEach((freq, idx) => {
    const tNota = now + 0.72 + idx * 0.06;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, tNota);

    g.gain.setValueAtTime(0.14, tNota);
    g.gain.exponentialRampToValueAtTime(0.001, tNota + 0.28);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(tNota);
    osc.stop(tNota + 0.3);
  });
}

/**
 * Som de Vitória / Conclusão de Vila/Cidade inteira
 */
export function tocarSomCompletarCidade(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const acordes = [
    { freq: 523.25, t: 0.0 }, // C5
    { freq: 659.25, t: 0.12 }, // E5
    { freq: 783.99, t: 0.24 }, // G5
    { freq: 1046.5, t: 0.4 }, // C6
    { freq: 1318.51, t: 0.6 }, // E6
    { freq: 1567.98, t: 0.8 }, // G6
  ];

  acordes.forEach(({ freq, t }) => {
    const tStart = now + t;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, tStart);

    ganho.gain.setValueAtTime(0.22, tStart);
    ganho.gain.exponentialRampToValueAtTime(0.001, tStart + 0.7);

    osc.connect(ganho);
    ganho.connect(ctx.destination);
    osc.start(tStart);
    osc.stop(tStart + 0.75);
  });
}

/**
 * Som suave de moedas para ajuda cooperativa
 */
export function tocarSomAjuda(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [987.77, 1318.51].forEach((freq, idx) => {
    const tNota = now + idx * 0.08;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, tNota);

    ganho.gain.setValueAtTime(0.15, tNota);
    ganho.gain.exponentialRampToValueAtTime(0.001, tNota + 0.2);

    osc.connect(ganho);
    ganho.connect(ctx.destination);
    osc.start(tNota);
    osc.stop(tNota + 0.22);
  });
}
