import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Gamepad2,
  Layers,
  Crown,
  FileCheck,
} from "lucide-react";
import { UserProfile } from "../../types";
import { usePlano } from "../../hooks/usePlano";

interface FileQuizGeneratorModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated?: (quizData: { title: string; questions: any[] }) => void;
  onOpenPaywall?: () => void;
}

export const FileQuizGeneratorModal: React.FC<FileQuizGeneratorModalProps> = ({
  user,
  isOpen,
  onClose,
  onQuizGenerated,
  onOpenPaywall,
}) => {
  const { t, i18n } = useTranslation();
  const { plano, isPro, obterLimite } = usePlano(user);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<{ title: string; questions: any[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const maxQuestions = obterLimite("perguntasPorQuizArquivo") || 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(t("quiz_arquivo.erro_tamanho", "O arquivo excede o limite máximo permitido de 10 MB."));
      return;
    }

    // Validação de extensão
    const allowedExts = [".pdf", ".docx", ".txt", ".md", ".jpg", ".jpeg", ".png"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExts.includes(ext)) {
      setErrorMsg(t("quiz_arquivo.erro_tipo", "Formato não suportado. Envie arquivos PDF, DOCX, TXT, MD ou imagens JPG/PNG."));
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", user.id || user.uid || "estudante");
      formData.append("language", i18n.language || "pt-BR");
      formData.append("numQuestions", String(maxQuestions));

      const res = await fetch("/api/quiz/generate-from-file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 403 && errData.error === "QUOTA_EXCEEDED") {
          if (onOpenPaywall) onOpenPaywall();
          throw new Error(t("quiz_arquivo.cota_esgotada", "Limite de quizzes por arquivo do plano gratuito atingido. Faça upgrade para o Pro para gerar quizzes ilimitados!"));
        }
        throw new Error(errData.error || t("quiz_arquivo.erro_geracao", "Falha ao ler o arquivo e estruturar o quiz."));
      }

      const data = await res.json();
      setGeneratedQuiz(data.quiz);
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro desconhecido");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-[var(--app-text)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-[var(--app-primary)] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">
                {t("quiz_arquivo.titulo", "Gerar Quiz a partir de Arquivo")}
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                {t("quiz_arquivo.subtitulo", "Envie apostilas, resumos ou fotos (PDF, DOCX, TXT, MD, JPG, PNG até 10 MB)")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan limits badge */}
        <div className="p-3.5 rounded-2xl bg-[var(--app-card-hover)] border border-[var(--app-border)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Crown className={`w-4 h-4 ${isPro ? "text-amber-500" : "text-neutral-400"}`} />
            <span>
              {t("quiz_arquivo.plano_atual", "Seu Plano:")} <strong>{plano.nome}</strong>
            </span>
          </div>
          <span className="font-bold text-[var(--app-primary)]">
            {isPro ? t("quiz_arquivo.quizzes_ilimitados", "Quizzes Ilimitados (20 questões)") : t("quiz_arquivo.limite_gratuito", "Até 5 questões por arquivo")}
          </span>
        </div>

        {!generatedQuiz ? (
          <div className="space-y-4">
            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--app-border)] hover:border-[var(--app-primary)] rounded-3xl p-8 text-center cursor-pointer transition bg-[var(--app-card-hover)]/30 space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-3xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] mx-auto flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--app-text)]">
                  {selectedFile ? selectedFile.name : t("quiz_arquivo.clique_ou_arraste", "Clique ou arraste seu arquivo aqui")}
                </p>
                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • ${t("quiz_arquivo.pronto_para_gerar", "Pronto para análise")}`
                    : t("quiz_arquivo.formatos_permitidos", "PDF, DOCX, TXT, Markdown, JPG ou PNG (Máximo 10 MB)")}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selectedFile || isProcessing}
              className="w-full py-3 rounded-2xl bg-[var(--app-primary)] text-white text-xs sm:text-sm font-bold shadow hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("quiz_arquivo.processando_arquivo", "Lendo material e formulando perguntas...")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t("quiz_arquivo.gerar_quiz_btn", "Gerar Quiz Inteligente ({{num}} Questões)", { num: maxQuestions })}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Preview do Quiz Gerado */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {generatedQuiz.title || t("quiz_arquivo.sucesso_titulo", "Quiz Gerado com Sucesso!")}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {t("quiz_arquivo.questoes_criadas", "Foram formuladas {{count}} questões com justificativas didáticas.", { count: generatedQuiz.questions.length })}
                </p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {generatedQuiz.questions.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[var(--app-card-hover)]/40 border border-[var(--app-border)] text-xs space-y-1">
                  <span className="font-bold text-[var(--app-primary)] block">Questão {idx + 1}:</span>
                  <p className="font-medium text-[var(--app-text)]">{q.question}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  if (onQuizGenerated) onQuizGenerated(generatedQuiz);
                  onClose();
                }}
                className="flex-1 py-3 rounded-2xl bg-[var(--app-primary)] text-white text-xs font-bold shadow hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                {t("quiz_arquivo.iniciar_simulado", "Iniciar no Brain Games (Simulados)")}
              </button>

              <button
                onClick={() => {
                  setGeneratedQuiz(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-3 rounded-2xl bg-[var(--app-card-hover)] hover:bg-[var(--app-border)] text-xs font-bold transition cursor-pointer"
              >
                {t("quiz_arquivo.outro_arquivo", "Outro Arquivo")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileQuizGeneratorModal;
