/**
 * Brain Studio - Cartão de Confirmação Rápida de Instituição para Alunos do IFES (Fase 7)
 * Permite ao aluno do IFES confirmar em 1 toque sem perder nenhum dado.
 */

import React, { useState } from "react";
import { GraduationCap, Check, ArrowRight, X } from "lucide-react";
import { confirmarMigracaoIfesEmUmToque } from "../services/migracaoIfes";
import { PerfilInstituicaoUsuario } from "../types";

interface CardConfirmacaoIfesProps {
  onConfirmado: (perfil: PerfilInstituicaoUsuario) => void;
  onTrocarInstituicao: () => void;
  onDispensar?: () => void;
}

export const CardConfirmacaoIfes: React.FC<CardConfirmacaoIfesProps> = ({
  onConfirmado,
  onTrocarInstituicao,
  onDispensar,
}) => {
  const [visivel, setVisivel] = useState(true);

  if (!visivel) return null;

  const handleConfirmar = () => {
    const perfil = confirmarMigracaoIfesEmUmToque();
    setVisivel(false);
    onConfirmado(perfil);
  };

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl shadow-lg animate-fade-in relative">
      {onDispensar && (
        <button
          onClick={() => {
            setVisivel(false);
            onDispensar();
          }}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Dispensar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-3.5 pr-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            Confirme sua Instituição de Ensino
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Detectamos que você estuda no{" "}
            <strong className="text-emerald-300">Instituto Federal do Espírito Santo (IFES)</strong>.
            Confirme com 1 toque para manter suas notas, matérias e tarefas perfeitamente sincronizadas.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <button
              onClick={handleConfirmar}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              Confirmar IFES
            </button>
            <button
              onClick={onTrocarInstituicao}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              Trocar instituição
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
