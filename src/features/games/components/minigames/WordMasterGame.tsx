import React, { useState, useEffect } from "react";
import {
  BookOpen,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  HelpCircle,
  Delete,
  Sparkles,
} from "lucide-react";
import {
  ANAGRAM_WORDS,
  SECRET_TERMS,
  SAMPLE_WORD_SEARCH,
  AnagramWord,
  SecretTermWord,
} from "../../data/wordMasterData";
import { gameAudio } from "../../audio";
import { SessionResultPayload } from "../../services/gamesService";

interface WordMasterGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

type WordMode = "ANAGRAM" | "SECRET_TERM" | "WORD_SEARCH";

export const WordMasterGame: React.FC<WordMasterGameProps> = ({
  sessionToken,
  onFinishGame,
  onExit,
}) => {
  const [mode, setMode] = useState<WordMode>("SECRET_TERM");
  const [score, setScore] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  // Estado para Anagramas
  const [anagramItem, setAnagramItem] = useState<AnagramWord>(ANAGRAM_WORDS[0]);
  const [anagramScrambled, setAnagramScrambled] = useState<string[]>([]);
  const [anagramSelected, setAnagramSelected] = useState<number[]>([]);
  const [anagramSuccess, setAnagramSuccess] = useState<boolean>(false);

  // Estado para Termo Secreto (Wordle Acadêmico)
  const [secretItem, setSecretItem] = useState<SecretTermWord>(SECRET_TERMS[0]);
  const [secretGuesses, setSecretGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [isSecretWon, setIsSecretWon] = useState<boolean>(false);
  const [isSecretGameOver, setIsSecretGameOver] = useState<boolean>(false);

  // Estado para Caça-Palavras
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [searchGrid, setSearchGrid] = useState<string[][]>(SAMPLE_WORD_SEARCH.gridLetters);
  const [selectedWordSearchPath, setSelectedWordSearchPath] = useState<[number, number][]>([]);

  // Inicializa Anagrama
  const initAnagram = () => {
    const randomItem = ANAGRAM_WORDS[Math.floor(Math.random() * ANAGRAM_WORDS.length)];
    setAnagramItem(randomItem);
    const letters = randomItem.word.split("").sort(() => Math.random() - 0.5);
    setAnagramScrambled(letters);
    setAnagramSelected([]);
    setAnagramSuccess(false);
  };

  // Inicializa Termo Secreto
  const initSecret = () => {
    const randomItem = SECRET_TERMS[Math.floor(Math.random() * SECRET_TERMS.length)];
    setSecretItem(randomItem);
    setSecretGuesses([]);
    setCurrentGuess("");
    setIsSecretWon(false);
    setIsSecretGameOver(false);
  };

  useEffect(() => {
    initAnagram();
    initSecret();
  }, []);

  // --- Handlers Anagrama ---
  const handleSelectScrambledLetter = (idx: number) => {
    if (anagramSuccess) return;
    if (anagramSelected.includes(idx)) return;
    gameAudio.playClick();
    const nextSelected = [...anagramSelected, idx];
    setAnagramSelected(nextSelected);

    const formedWord = nextSelected.map((i) => anagramScrambled[i]).join("");
    if (formedWord === anagramItem.word) {
      gameAudio.playCorrect();
      setAnagramSuccess(true);
      const points = 120;
      setScore((prev) => prev + points);
      setSolvedCount((prev) => prev + 1);
    } else if (formedWord.length === anagramItem.word.length) {
      gameAudio.playWrong();
      setTimeout(() => setAnagramSelected([]), 600);
    }
  };

  const handleBackspaceAnagram = () => {
    if (anagramSelected.length === 0 || anagramSuccess) return;
    gameAudio.playClick();
    setAnagramSelected((prev) => prev.slice(0, -1));
  };

  // --- Handlers Termo Secreto ---
  const handleVirtualKeyPress = (letter: string) => {
    if (isSecretWon || isSecretGameOver) return;
    if (currentGuess.length < secretItem.word.length) {
      gameAudio.playClick();
      setCurrentGuess((prev) => prev + letter);
    }
  };

  const handleDeleteLetter = () => {
    if (currentGuess.length > 0) {
      gameAudio.playClick();
      setCurrentGuess((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmitGuess = () => {
    if (currentGuess.length !== secretItem.word.length) return;

    const newGuesses = [...secretGuesses, currentGuess];
    setSecretGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess === secretItem.word) {
      gameAudio.playVictory();
      setIsSecretWon(true);
      const points = 150 - (newGuesses.length - 1) * 20;
      setScore((prev) => prev + points);
      setSolvedCount((prev) => prev + 1);
    } else if (newGuesses.length >= 6) {
      gameAudio.playWrong();
      setIsSecretGameOver(true);
    } else {
      gameAudio.playCardFlip();
    }
  };

  // Avaliação de cores das letras do Termo Secreto
  const getLetterStatus = (letter: string, index: number, target: string) => {
    if (target[index] === letter) return "correct"; // verde
    if (target.includes(letter)) return "present"; // amarelo
    return "absent"; // cinza
  };

  // --- Handlers Caça-Palavras ---
  const handleGridCellClick = (r: number, c: number) => {
    gameAudio.playClick();
    const newPath: [number, number][] = [...selectedWordSearchPath, [r, c]];
    setSelectedWordSearchPath(newPath);

    const formed = newPath.map(([row, col]) => searchGrid[row][col]).join("");
    const matched = SAMPLE_WORD_SEARCH.targetWords.find((tw) => tw.word === formed);

    if (matched && !foundWords.includes(matched.word)) {
      gameAudio.playCorrect();
      setFoundWords((prev) => [...prev, matched.word]);
      setSelectedWordSearchPath([]);
      setScore((prev) => prev + 80);
      setSolvedCount((prev) => prev + 1);
    } else if (newPath.length >= 8) {
      setSelectedWordSearchPath([]);
    }
  };

  const handleFinishSession = () => {
    gameAudio.playVictory();
    onFinishGame({
      sessionToken,
      gameId: "word_master",
      score,
      phasesCompleted: solvedCount,
      extraNote: `Palavras resolvidas: ${solvedCount} (${mode})`,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-500 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight">Word Master</h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 5 • Vocabulário Acadêmico</span>
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

      {/* Seletor de Modo e Pontuação */}
      <div className="px-6 py-3 border-b border-[var(--app-border)] flex flex-wrap items-center justify-between gap-3 bg-[var(--app-bg)]/40 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMode("SECRET_TERM")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              mode === "SECRET_TERM"
                ? "bg-pink-600 text-white shadow-xs"
                : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)]"
            }`}
          >
            Termo Secreto
          </button>
          <button
            onClick={() => setMode("ANAGRAM")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              mode === "ANAGRAM"
                ? "bg-pink-600 text-white shadow-xs"
                : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)]"
            }`}
          >
            Anagrama
          </button>
          <button
            onClick={() => setMode("WORD_SEARCH")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              mode === "WORD_SEARCH"
                ? "bg-pink-600 text-white shadow-xs"
                : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)]"
            }`}
          >
            Caça-Palavras
          </button>
        </div>

        <div className="flex items-center gap-4 font-mono font-bold">
          <span className="text-pink-500">Pontos: {score}</span>
          <span className="text-emerald-500">Resolvidos: {solvedCount}</span>
        </div>
      </div>

      {/* CORPO DO MODO SELECIONADO */}
      <div className="p-6 sm:p-8 flex-1">
        {/* MODO 1: TERMO SECRETO (WORDLE ACADÊMICO) */}
        {mode === "SECRET_TERM" && (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-500 font-semibold">
                {secretItem.category}
              </span>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-1">
                <strong>Dica:</strong> {secretItem.clue}
              </p>
            </div>

            {/* Grid de Palpites */}
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5].map((rowIdx) => {
                const guess = secretGuesses[rowIdx] || (rowIdx === secretGuesses.length ? currentGuess : "");
                const isGuessedRow = rowIdx < secretGuesses.length;

                return (
                  <div key={rowIdx} className="flex justify-center gap-2">
                    {Array.from({ length: secretItem.word.length }).map((_, colIdx) => {
                      const letter = guess[colIdx] || "";
                      let styleClass = "border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 text-[var(--app-text)]";

                      if (isGuessedRow) {
                        const status = getLetterStatus(letter, colIdx, secretItem.word);
                        if (status === "correct") {
                          styleClass = "bg-emerald-500 border-emerald-600 text-white font-black";
                        } else if (status === "present") {
                          styleClass = "bg-amber-500 border-amber-600 text-white font-black";
                        } else {
                          styleClass = "bg-[var(--app-border)] text-[var(--app-text-muted)] border-transparent";
                        }
                      }

                      return (
                        <div
                          key={colIdx}
                          className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center font-mono font-black text-lg select-none transition-all duration-200 ${styleClass}`}
                        >
                          {letter}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Teclado Virtual */}
            {!isSecretWon && !isSecretGameOver && (
              <div className="space-y-1.5 pt-2">
                {[
                  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
                  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
                  ["Z", "X", "C", "V", "B", "N", "M"],
                ].map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1">
                    {rIdx === 2 && (
                      <button
                        onClick={handleSubmitGuess}
                        className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs cursor-pointer"
                      >
                        ENTER
                      </button>
                    )}
                    {row.map((char) => (
                      <button
                        key={char}
                        onClick={() => handleVirtualKeyPress(char)}
                        className="w-8 sm:w-9 h-10 rounded-lg bg-[var(--app-card-secondary)] hover:bg-[var(--app-border)] border border-[var(--app-border)] font-bold text-xs text-[var(--app-text)] flex items-center justify-center cursor-pointer active:scale-95 transition"
                      >
                        {char}
                      </button>
                    ))}
                    {rIdx === 2 && (
                      <button
                        onClick={handleDeleteLetter}
                        className="px-2.5 py-2 rounded-lg bg-[var(--app-border)] hover:bg-[var(--app-border)]/80 text-[var(--app-text)] font-bold text-xs cursor-pointer flex items-center justify-center"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Mensagem de Vitória ou Fim */}
            {(isSecretWon || isSecretGameOver) && (
              <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-3 animate-fade-in">
                <p className="text-sm font-bold text-[var(--app-text)]">
                  {isSecretWon ? "Parabéns, você descobriu a palavra!" : "Fim das tentativas!"}
                </p>
                <p className="text-xs text-[var(--app-text-muted)]">
                  A palavra era <strong className="text-pink-500 font-mono text-sm">{secretItem.displayWord}</strong>. {secretItem.context}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={initSecret}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Próxima Palavra
                  </button>
                  <button
                    onClick={handleFinishSession}
                    className="px-4 py-2 rounded-xl border border-[var(--app-border)] text-[var(--app-text)] font-bold text-xs cursor-pointer"
                  >
                    Salvar e Concluir
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODO 2: ANAGRAMA */}
        {mode === "ANAGRAM" && (
          <div className="space-y-6 max-w-md mx-auto text-center">
            <div className="space-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-500 font-semibold">
                {anagramItem.category}
              </span>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-1">
                <strong>Dica:</strong> {anagramItem.hint}
              </p>
            </div>

            {/* Letras Selecionadas */}
            <div className="flex justify-center gap-2 min-h-[50px] items-center">
              {anagramSelected.map((origIdx, pos) => (
                <div
                  key={pos}
                  className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center font-mono font-black text-lg select-none transition ${
                    anagramSuccess
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : "bg-pink-500/20 border-pink-500 text-pink-500"
                  }`}
                >
                  {anagramScrambled[origIdx]}
                </div>
              ))}
              {Array.from({ length: anagramItem.word.length - anagramSelected.length }).map((_, i) => (
                <div
                  key={i}
                  className="w-11 h-12 rounded-xl border-2 border-dashed border-[var(--app-border)] flex items-center justify-center text-[var(--app-text-muted)]"
                >
                  _
                </div>
              ))}
            </div>

            {/* Letras Disponíveis para Clicar */}
            <div className="flex justify-center flex-wrap gap-2 pt-4">
              {anagramScrambled.map((char, idx) => {
                const isUsed = anagramSelected.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={isUsed || anagramSuccess}
                    onClick={() => handleSelectScrambledLetter(idx)}
                    className={`w-12 h-12 rounded-2xl border font-mono font-black text-lg transition cursor-pointer ${
                      isUsed
                        ? "opacity-20 border-[var(--app-border)] bg-[var(--app-card-secondary)] text-[var(--app-text-muted)]"
                        : "bg-[var(--app-card-secondary)] border-[var(--app-border)] hover:border-pink-500 text-[var(--app-text)] hover:scale-105 active:scale-95"
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleBackspaceAnagram}
                disabled={anagramSelected.length === 0 || anagramSuccess}
                className="px-4 py-2 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)] text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
              >
                Apagar Letra
              </button>
              {anagramSuccess && (
                <button
                  onClick={initAnagram}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold cursor-pointer"
                >
                  Próximo Anagrama
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODO 3: CAÇA-PALAVRAS */}
        {mode === "WORD_SEARCH" && (
          <div className="space-y-6 flex flex-col items-center">
            <div className="text-center space-y-1">
              <h5 className="font-bold text-sm text-[var(--app-text)]">{SAMPLE_WORD_SEARCH.title}</h5>
              <p className="text-xs text-[var(--app-text-muted)]">
                Clique nas letras em sequência para encontrar os termos ocultos na matriz.
              </p>
            </div>

            {/* Matriz do Caça-Palavras */}
            <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)] inline-block select-none">
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                {searchGrid.map((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    const isSelected = selectedWordSearchPath.some(([r, c]) => r === rIdx && c === cIdx);
                    return (
                      <button
                        key={`${rIdx}_${cIdx}`}
                        onClick={() => handleGridCellClick(rIdx, cIdx)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono font-bold text-xs sm:text-sm flex items-center justify-center transition cursor-pointer ${
                          isSelected
                            ? "bg-pink-600 text-white shadow-xs"
                            : "bg-[var(--app-card)] border border-[var(--app-border)]/50 text-[var(--app-text)] hover:border-pink-500/50"
                        }`}
                      >
                        {cell}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Lista de Palavras Alvo */}
            <div className="w-full max-w-md space-y-2">
              <span className="text-xs font-bold text-[var(--app-text-muted)] block text-center">
                Palavras para encontrar ({foundWords.length}/{SAMPLE_WORD_SEARCH.targetWords.length}):
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {SAMPLE_WORD_SEARCH.targetWords.map((tw) => {
                  const isFound = foundWords.includes(tw.word);
                  return (
                    <span
                      key={tw.word}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                        isFound
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500 line-through"
                          : "bg-[var(--app-card-secondary)] border-[var(--app-border)] text-[var(--app-text-muted)]"
                      }`}
                    >
                      {tw.word}
                    </span>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleFinishSession}
              className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Finalizar e Registrar Pontuação
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
