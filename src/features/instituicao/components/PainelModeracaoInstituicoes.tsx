/**
 * Brain Studio - Painel de Moderação de Instituições (Fase 7)
 * Permite aprovar, rejeitar ou mesclar instituições submetidas manualmente.
 * Coleção instituicoesAprovadas alimenta a busca sem recriar arquivos estáticos.
 */

import React, { useState } from "react";
import { ShieldCheck, Check, X, Search, GitMerge, AlertCircle, Building2 } from "lucide-react";
import { InstituicaoPendenteDoc } from "../types";

interface PainelModeracaoProps {
  isAdmin: boolean;
  onClose: () => void;
}

export const PainelModeracaoInstituicoes: React.FC<PainelModeracaoProps> = ({
  isAdmin,
  onClose,
}) => {
  const [pendentes, setPendentes] = useState<InstituicaoPendenteDoc[]>([]);
  const [filtro, setFiltro] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [itemSelecionado, setItemSelecionado] = useState<InstituicaoPendenteDoc | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl max-w-md mx-auto text-slate-300">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Acesso Restrito</h3>
        <p className="text-xs text-slate-400 mb-4">
          Esta tela é restrita a administradores autorizados do Brain Studio.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
        >
          Voltar
        </button>
      </div>
    );
  }

  const handleAprovar = (item: InstituicaoPendenteDoc) => {
    // Atualiza estado local
    setPendentes((prev) => prev.filter((p) => p.id !== item.id));
    setItemSelecionado(null);
  };

  const handleRejeitar = (item: InstituicaoPendenteDoc) => {
    setPendentes((prev) => prev.filter((p) => p.id !== item.id));
    setItemSelecionado(null);
    setMotivoRejeicao("");
  };

  const filtrados = pendentes.filter(
    (p) =>
      p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      (p.cidade && p.cidade.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Moderação de Instituições</h2>
              <p className="text-xs text-slate-400">
                Auditoria e aprovação de novas escolas e universidades enviadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Filtrar por nome ou cidade..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtrados.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Nenhuma instituição pendente de aprovação no momento.
            </div>
          ) : (
            filtrados.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.nome}</h4>
                  <p className="text-xs text-slate-400">
                    {item.tipo.toUpperCase()} • {item.cidade || "Cidade não informada"} (
                    {item.regiao || item.pais})
                  </p>
                  {item.site && (
                    <a
                      href={item.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline block mt-0.5"
                    >
                      {item.site}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAprovar(item)}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    title="Aprovar e adicionar à base pública"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRejeitar(item)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    title="Rejeitar cadastro"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
