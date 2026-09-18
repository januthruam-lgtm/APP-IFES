import React, { useState } from "react";
import { X, Upload, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { IfesAssignment, UserProfile } from "../../types";
import confetti from "canvas-confetti";

interface AvaSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: IfesAssignment | null;
  user: UserProfile;
  onSuccess: (updated: IfesAssignment) => void;
}

export const AvaSubmissionModal: React.FC<AvaSubmissionModalProps> = ({
  isOpen,
  onClose,
  assignment,
  user,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      confetti({ particleCount: 40, spread: 60 });

      const updatedAssignment: IfesAssignment = {
        ...assignment,
        status: "submitted",
      };

      onSuccess(updatedAssignment);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFile(null);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-white/10 p-6 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Submissão AVA IFES
            </span>
            <h3 className="text-lg font-bold">{assignment.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-base font-bold text-emerald-300">Tarefa enviada com sucesso ao AVA!</p>
            <p className="text-xs text-neutral-400">Status atualizado no seu painel.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-neutral-300 mb-2 font-medium">
                Matéria: <span className="text-white font-semibold">{assignment.courseName}</span>
              </p>
              <p className="text-xs text-neutral-400">
                Data Limite: {assignment.dueDate || "A definir"}
              </p>
            </div>

            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-400 transition cursor-pointer relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />
              <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-neutral-300">
                    Clique ou arraste seu arquivo aqui
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">PDF, DOCX, ZIP até 25MB</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Comentários da submissão (opcional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Observações para o professor..."
                className="w-full bg-neutral-800 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition flex items-center gap-2"
              >
                {isSubmitting ? "Enviando..." : "Confirmar Envio"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
