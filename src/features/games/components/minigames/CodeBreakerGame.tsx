import React, { useState, useEffect } from "react";
import {
  KeyRound,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  HelpCircle,
  Delete,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { gameAudio } from "../../audio";
import { SessionResultPayload } from "../../services/gamesService";

interface CodeBreakerGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

interface GuessRow {
  digits: number[];
  exactMatches: number; // Corretos na posição certa (Verdes)
  partialMatches: number; // Corretos na posição errada (Amarelos)
}

export const CodeBreakerGame: React.FC<CodeBreakerGameProps> = ({
  sessionToken,
  onFinishGame,
  onExit,
}) => {
  const [secretCode, setSecretCode] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [currentInput, setCurrentInput] = useState<number[]>([]);
  const [eliminatedDigits, setEliminatedDigits] = useState<number[]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  const MAX_ATTEMPTS = 8;
  const CODE_LENGTH = 4;

  const initGame = () => {
    // Gera código de 4 dígitos únicos entre 0 e 9
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    const code = digits.slice(0, CODE_LENGTH);
    setSecretCode(code);
    setGuesses([]);
    setCurrentInput([]);
    setEliminatedDigits([]);
    setIsWon(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handlePressDigit = (d: number) => {
    if (isWon || isGameOver) return;
    if (currentInput.length < CODE_LENGTH && !currentInput.includes(d)) {
      gameAudio.playClick();
      setCurrentInput((prev) => [...prev, d]);
    }
  };

  const handleBackspace = () => {
    if (currentInput.length > 0) {
      gameAudio.playClick();
      setCurrentInput((prev) => prev.slice(0, -1));
    }
  };

  const handleToggleEliminated = (d: number) => {
    gameAudio.playClick();
    setEliminatedDigits((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSubmitGuess = () => {
    if (currentInput.length !== CODE_LENGTH) return;

    let exact = 0;
    let partial = 0;

    currentInput.forEach((d, idx) => {
      if (secretCode[idx] === d) {
        exact++;
      } else if (secretCode.includes(d)) {
        partial++;
      }
    });

    const newRow: GuessRow = {
      digits: [...currentInput],
      exactMatches: exact,
      partialMatches: partial,
    };

    const nextGuesses = [...guesses, newRow];
    setGuesses(nextGuesses);
    setCurrentInput([]);

    if (exact === CODE_LENGTH) {
      // Vitória
      gameAudio.playVictory();
      setIsWon(true);
      const score = Math.max(100, 300 - (nextGuesses.length - 1) * 30);
      onFinishGame({
        sessionToken,
        gameId: "code_breaker",
        score,
        movesCount: nextGuesses.length,
        extraNote: `Código quebrado em ${nextGuesses.length} tentativas!`,
      });
    } else if (nextGuesses.length >= MAX_ATTEMPTS) {
      // Fim de jogo
      gameAudio.playWrong();
      setIsGameOver(true);
      onFinishGame({
        sessionToken,
        gameId: "code_breaker",
        score: 30,
        movesCount: MAX_ATTEMPTS,
        extraNote: `Código não quebrado (${secretCode.join("")})`,
      });
    } else {
      if (exact > 0) gameAudio.playCorrect();
      else gameAudio.playCardFlip();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight">Code Breaker</h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 16 • Criptoanálise & Dedução</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = gameAudio.toggleMute();
              setIsAudioMuted(muted);
            }}
            className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]/50 transition cursor-pointer"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onExit}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Regras e Tentativas Restantes */}
      <div className="px-6 py-2.5 border-b border-[var(--app-border)] bg-[var(--app-bg)]/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-500 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Posição Exata
          </span>
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Dígito Correto (Posição Incorreta)
          </span>
        </div>
        <span className="font-mono font-bold text-[var(--app-text)]">
          {guesses.length} / {MAX_ATTEMPTS} tentativas
        </span>
      </div>

      <div className="p-6 sm:p-8 flex-1 space-y-6">
        {/* Histórico de Palpites */}
        <div className="space-y-2 max-w-md mx-auto">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            const guess = guesses[rowIdx];
            const isCurrentRow = rowIdx === guesses.length;

            return (
              <div
                key={rowIdx}
                className={`flex items-center justify-between p-2 rounded-2xl border transition ${
                  isCurrentRow
                    ? "bg-indigo-500/10 border-indigo-500/40"
                    : guess
                    ? "bg-[var(--app-card-secondary)]/50 border-[var(--app-border)]"
                    : "opacity-30 border-dashed border-[var(--app-border)]"
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-[var(--app-text-muted)] w-6 text-center">
                  #{rowIdx + 1}
                </span>

                {/* 4 Slots */}
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const digit = guess ? guess.digits[slotIdx] : isCurrentRow ? currentInput[slotIdx] : null;

                    return (
                      <div
                        key={slotIdx}
                        className={`w-9 h-10 rounded-xl border flex items-center justify-center font-mono font-black text-sm ${
                          digit !== undefined && digit !== null
                            ? "bg-[var(--app-card)] border-indigo-500/50 text-[var(--app-text)] shadow-xs"
                            : "bg-[var(--app-bg)]/40 border-[var(--app-border)] text-transparent"
                        }`}
                      >
                        {digit !== undefined && digit !== null ? digit : "•"}
                      </div>
                    );
                  })}
                </div>

                {/* Pistas (Pins) */}
                <div className="flex items-center gap-1.5 w-24 justify-end">
                  {guess ? (
                    <>
                      {Array.from({ length: guess.exactMatches }).map((_, i) => (
                        <div key={`ex_${i}`} className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" title="Exato" />
                      ))}
                      {Array.from({ length: guess.partialMatches }).map((_, i) => (
                        <div key={`par_${i}`} className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" title="Parcial" />
                      ))}
                      {Array.from({ length: CODE_LENGTH - guess.exactMatches - guess.partialMatches }).map((_, i) => (
                        <div key={`emp_${i}`} className="w-3.5 h-3.5 rounded-full bg-[var(--app-border)]" />
                      ))}
                    </>
                  ) : (
                    <span className="text-[10px] text-[var(--app-text-muted)] font-mono">---</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Teclado Numérico com Função de Risco/Eliminação */}
        {!isWon && !isGameOver && (
          <div className="max-w-md mx-auto space-y-3 pt-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--app-text-muted)]">
              <span>Selecione 4 dígitos diferentes:</span>
              <span className="text-[10px] italic">Clique com botão secundário ou use para descartar</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                const isEliminated = eliminatedDigits.includes(digit);
                const isSelected = currentInput.includes(digit);

                return (
                  <button
                    key={digit}
                    onClick={() => handlePressDigit(digit)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleToggleEliminated(digit);
                    }}
                    className={`py-3 rounded-xl font-mono font-black text-sm border transition cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : isEliminated
                        ? "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] opacity-35 line-through border-[var(--app-border)]"
                        : "bg-[var(--app-card-secondary)] border-[var(--app-border)] hover:border-indigo-500 text-[var(--app-text)]"
                    }`}
                  >
                    {digit}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleBackspace}
                disabled={currentInput.length === 0}
                className="flex-1 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:bg-[var(--app-border)]/50 text-[var(--app-text)] font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Delete className="w-4 h-4" />
                <span>Apagar</span>
              </button>
              <button
                onClick={handleSubmitGuess}
                disabled={currentInput.length !== CODE_LENGTH}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentInput.length === CODE_LENGTH
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] border border-[var(--app-border)] opacity-50 cursor-not-allowed"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Testar Código</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal de Fim de Jogo ou Vitória */}
        {(isWon || isGameOver) && (
          <div className="p-5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-3 max-w-md mx-auto animate-fade-in">
            <h4 className="text-xl font-black text-[var(--app-text)]">
              {isWon ? "Código Decifrado com Sucesso!" : "Tentativas Esgotadas!"}
            </h4>
            <p className="text-xs text-[var(--app-text-muted)]">
              O código secreto era <strong className="font-mono text-indigo-500 text-sm tracking-widest">{secretCode.join("")}</strong>.
            </p>

            <div className="flex justify-center gap-3 pt-1">
              <button
                onClick={initGame}
                className="px-4 py-2 rounded-xl border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
              >
                Jogar Novamente
              </button>
              <button
                onClick={onExit}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                Voltar à Central
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
