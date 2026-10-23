/**
 * Brain Studio - Modal de Cadastro Manual de Instituição (Fase 7)
 * Permite cadastrar escola/universidade não encontrada na base oficial.
 * Inclui validação de HTTPS, detecção de duplicatas similares e limite de 3/dia.
 */

import React, { useState } from "react";
import { X, AlertCircle, CheckCircle2, Building, Globe, MapPin, Send } from "lucide-react";
import { Instituicao, TipoInstituicao } from "../types";
import { validarUrlSegura } from "../../../config/conectores.config";
import { buscarInstituicoes, normalizarTexto } from "../services/searchInstituicoes";

interface CadastroManualModalProps {
  paisIso: string;
  regiaoPrevia?: string;
  cidadePrevia?: string;
  onClose: () => void;
  onInstituicaoCadastrada: (instituicao: Instituicao) => void;
}

const PALAVRAS_OFENSIVAS = ["teste123", "palavrao", "fake", "lixo"];

export const CadastroManualModal: React.FC<CadastroManualModalProps> = ({
  paisIso,
  regiaoPrevia = "",
  cidadePrevia = "",
  onClose,
  onInstituicaoCadastrada,
}) => {
  const [nome, setNome] = useState("");
  const [sigla, setSigla] = useState("");
  const [regiao, setRegiao] = useState(regiaoPrevia);
  const [cidade, setCidade] = useState(cidadePrevia);
  const [tipo, setTipo] = useState<TipoInstituicao>("superior");
  const [site, setSite] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sugestaoDuplicada, setSugestaoDuplicada] = useState<Instituicao | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Verifica limite de envios (3 por dia por dispositivo)
  const verificarLimiteDiario = (): boolean => {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const storageKey = `brain_submissoes_instituicao_${hoje}`;
      const count = parseInt(localStorage.getItem(storageKey) || "0", 10);
      return count < 3;
    } catch {
      return true;
    }
  };

  const registrarEnvio = () => {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const storageKey = `brain_submissoes_instituicao_${hoje}`;
      const count = parseInt(localStorage.getItem(storageKey) || "0", 10);
      localStorage.setItem(storageKey, (count + 1).toString());
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const nomeTrim = nome.trim();
    if (nomeTrim.length < 3) {
      setErro("O nome da instituição deve ter pelo menos 3 caracteres.");
      return;
    }

    // Filtro básico de palavras ofensivas/spam
    const norm = normalizarTexto(nomeTrim);
    for (const p of PALAVRAS_OFENSIVAS) {
      if (norm.includes(p)) {
        setErro("Nome inválido ou inapropriado. Por favor insira a denominação oficial.");
        return;
      }
    }

    // Validação de URL segura (se fornecida)
    if (site.trim()) {
      const validacaoSite = validarUrlSegura(site.trim());
      if (!validacaoSite.valida) {
        setErro(`Site institucional inválido: ${validacaoSite.erro || "URL inválida"}`);
        return;
      }
    }

    if (!verificarLimiteDiario()) {
      setErro("Limite diário de 3 cadastros de instituições atingido. Tente novamente amanhã.");
      return;
    }

    // Detecção de duplicidade por similaridade antes de prosseguir
    setSalvando(true);
    try {
      const similares = await buscarInstituicoes({
        pais: paisIso,
        query: nomeTrim,
        limite: 3,
      });

      if (similares.length > 0 && !sugestaoDuplicada) {
        const maisProxima = similares[0];
        const nNorm = normalizarTexto(maisProxima.nome);
        if (nNorm === norm || nNorm.includes(norm) || norm.includes(nNorm)) {
          setSugestaoDuplicada(maisProxima);
          setSalvando(false);
          return;
        }
      }

      // Cria a instituição manual
      const idGerado = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const novaInstituicao: Instituicao = {
        id: idGerado,
        nome: nomeTrim,
        sigla: sigla.trim() || undefined,
        tipo,
        rede: "outra",
        pais: paisIso.toUpperCase(),
        regiao: regiao.trim() || undefined,
        cidade: cidade.trim() || undefined,
        site: site.trim() || undefined,
        fonte: "Manual",
        importadoEm: new Date().toISOString(),
      };

      registrarEnvio();
      onInstituicaoCadastrada(novaInstituicao);
    } catch (err) {
      console.error("Erro ao validar cadastro:", err);
      setErro("Erro ao registrar instituição. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cadastrar Instituição</h3>
            <p className="text-xs text-slate-400">
              Disponível imediatamente para você. Máximo de 3 envios por dia.
            </p>
          </div>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {sugestaoDuplicada && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <p className="font-semibold mb-1">Encontramos uma instituição com nome parecido:</p>
            <p className="text-sm font-bold text-white">{sugestaoDuplicada.nome}</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {sugestaoDuplicada.cidade ? `${sugestaoDuplicada.cidade} - ` : ""}
              {sugestaoDuplicada.regiao || sugestaoDuplicada.pais}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => onInstituicaoCadastrada(sugestaoDuplicada)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition"
              >
                Usar esta instituição
              </button>
              <button
                type="button"
                onClick={() => {
                  setSugestaoDuplicada(null);
                  handleSubmit({ preventDefault: () => {} } as any);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
              >
                Continuar com meu cadastro
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome Oficial da Instituição *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Escola Estadual Machado de Assis"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sigla (Opcional)
              </label>
              <input
                type="text"
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                placeholder="Ex: EEMA"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Ensino *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoInstituicao)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="basica">Educação Básica / Escola</option>
                <option value="tecnica">Ensino Técnico / Profissional</option>
                <option value="superior">Ensino Superior / Faculdade</option>
                <option value="idiomas">Escola de Idiomas</option>
                <option value="outra">Outro / Livre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estado / Província
              </label>
              <input
                type="text"
                value={regiao}
                onChange={(e) => setRegiao(e.target.value)}
                placeholder="Ex: ES, SP, RJ..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Vitória"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Site Oficial da Instituição (Opcional, https://)
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="url"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="https://suaescola.edu.br"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Deve usar HTTPS. Endereços IP locais e links não oficiais são bloqueados por segurança.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              {salvando ? "Validando..." : "Salvar Instituição"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
