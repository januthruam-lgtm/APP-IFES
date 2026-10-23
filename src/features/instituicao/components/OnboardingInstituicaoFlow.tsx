/**
 * Brain Studio - Fluxo de Onboarding Multi-Instituição (Fase 7)
 * 7 etapas ágeis (< 60s), rascunho salvo, Intl.DisplayNames e modo offline.
 * Aviso legal fixo sem logos de terceiros.
 */

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building,
  GraduationCap,
  MapPin,
  Globe,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  Plus,
} from "lucide-react";
import { Instituicao, PerfilInstituicaoUsuario } from "../types";
import {
  buscarInstituicoes,
  getNomePais,
  UFS_BRASIL,
  obterCidadesDisponiveis,
  obterRegioesDisponiveis,
} from "../services/searchInstituicoes";
import { getNiveisPorPais, NivelEnsino, PERIODOS_ACADEMICOS } from "../../../config/niveis.config";
import { getSistemaNotaPadraoPorPais } from "../../../config/notas.config";
import { CadastroManualModal } from "./CadastroManualModal";
import { salvarPerfilInstituicaoLocal } from "../services/migracaoIfes";

interface OnboardingFlowProps {
  onConcluido: (perfil: PerfilInstituicaoUsuario) => void;
  onCancelar?: () => void;
}

const RASCUNHO_STORAGE_KEY = "brain_onboarding_draft_v1";

export const OnboardingInstituicaoFlow: React.FC<OnboardingFlowProps> = ({
  onConcluido,
  onCancelar,
}) => {
  const [etapa, setEtapa] = useState<number>(1);

  // Estados dos campos
  const [pais, setPais] = useState<string>("BR");
  const [regiao, setRegiao] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState<Instituicao | null>(null);
  const [buscaInstituicao, setBuscaInstituicao] = useState<string>("");
  const [listaInstituicoes, setListaInstituicoes] = useState<Instituicao[]>([]);
  const [carregandoInstituicoes, setCarregandoInstituicoes] = useState<boolean>(false);

  const [nivelId, setNivelId] = useState<string>("");
  const [cursoOuSerie, setCursoOuSerie] = useState<string>("");
  const [sistemaConectadoRapido, setSistemaConectadoRapido] = useState<string | null>(null);

  // Auxiliares
  const [cidadesSugeridas, setCidadesSugeridas] = useState<string[]>([]);
  const [regioesSugeridas, setRegioesSugeridas] = useState<string[]>([]);
  const [modalCadastroManual, setModalCadastroManual] = useState<boolean>(false);

  // Sugestão de país inicial pelo idioma/fuso do aparelho (sem GPS)
  useEffect(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (timeZone.includes("Sao_Paulo") || timeZone.includes("Brazil")) {
        setPais("BR");
      } else if (timeZone.includes("Lisbon") || timeZone.includes("Portugal")) {
        setPais("PT");
      }
    } catch {}

    // Restaura rascunho se existir
    try {
      const rascunhoRaw = localStorage.getItem(RASCUNHO_STORAGE_KEY);
      if (rascunhoRaw) {
        const d = JSON.parse(rascunhoRaw);
        if (d.pais) setPais(d.pais);
        if (d.regiao) setRegiao(d.regiao);
        if (d.cidade) setCidade(d.cidade);
        if (d.instituicao) setInstituicaoSelecionada(d.instituicao);
        if (d.nivelId) setNivelId(d.nivelId);
        if (d.cursoOuSerie) setCursoOuSerie(d.cursoOuSerie);
        if (d.etapa && d.etapa <= 7) setEtapa(d.etapa);
      }
    } catch {}
  }, []);

  // Salva rascunho ao alterar campos ou etapa
  useEffect(() => {
    try {
      localStorage.setItem(
        RASCUNHO_STORAGE_KEY,
        JSON.stringify({
          pais,
          regiao,
          cidade,
          instituicao: instituicaoSelecionada,
          nivelId,
          cursoOuSerie,
          etapa,
        })
      );
    } catch {}
  }, [pais, regiao, cidade, instituicaoSelecionada, nivelId, cursoOuSerie, etapa]);

  // Carrega cidades e regiões dinâmicas para o país selecionado
  useEffect(() => {
    obterRegioesDisponiveis(pais).then(setRegioesSugeridas);
    obterCidadesDisponiveis(pais, regiao).then(setCidadesSugeridas);
  }, [pais, regiao]);

  // Carrega busca de instituições quando entra na etapa 4 ou busca
  useEffect(() => {
    if (etapa === 4) {
      setCarregandoInstituicoes(true);
      buscarInstituicoes({
        pais,
        regiao: regiao || undefined,
        cidade: cidade || undefined,
        query: buscaInstituicao,
        limite: 20,
      })
        .then(setListaInstituicoes)
        .finally(() => setCarregandoInstituicoes(false));
    }
  }, [etapa, pais, regiao, cidade, buscaInstituicao]);

  const niveisDisponiveis: NivelEnsino[] = getNiveisPorPais(pais);

  const handleSelecionarAutodidata = () => {
    const instAutodidata: Instituicao = {
      id: "autodidata",
      nome: "Autodidata / Estudos Independentes",
      tipo: "outra",
      rede: "outra",
      pais: pais.toUpperCase(),
      fonte: "Manual",
      importadoEm: new Date().toISOString(),
    };
    setInstituicaoSelecionada(instAutodidata);
    setNivelId(niveisDisponiveis[0]?.id || "int_other");
    setCursoOuSerie("Estudos Livres");
    setEtapa(6);
  };

  const handleFinalizar = () => {
    if (!instituicaoSelecionada) return;

    const sistemaNotaId = getSistemaNotaPadraoPorPais(pais);
    const perfil: PerfilInstituicaoUsuario = {
      instituicaoId: instituicaoSelecionada.id,
      nome: instituicaoSelecionada.nome,
      sigla: instituicaoSelecionada.sigla,
      tipo: instituicaoSelecionada.tipo,
      pais: pais.toUpperCase(),
      regiao: regiao || instituicaoSelecionada.regiao,
      cidade: cidade || instituicaoSelecionada.cidade,
      nivelId: nivelId || niveisDisponiveis[0]?.id || "medio",
      cursoOuSerie: cursoOuSerie.trim() || "Geral",
      sistemaNotaId,
      periodoId: "bimestre",
      confirmada: true,
      atualizadoEm: Date.now(),
    };

    salvarPerfilInstituicaoLocal(perfil);
    try {
      localStorage.removeItem(RASCUNHO_STORAGE_KEY);
    } catch {}

    onConcluido(perfil);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col justify-between">
        {/* Barra de Progresso Superior */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Etapa {etapa} de 7
            </span>
            <span className="text-xs text-slate-500">
              {Math.round((etapa / 7) * 100)}% concluído
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(etapa / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Conteúdo Dinâmico por Etapa */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* ETAPA 1: PAÍS */}
          {etapa === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  Em qual país você estuda?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Adaptamos os níveis de ensino, sistema de notas e calendário da sua região.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { iso: "BR", label: getNomePais("BR") },
                  { iso: "PT", label: getNomePais("PT") },
                  { iso: "US", label: getNomePais("US") },
                  { iso: "GB", label: getNomePais("GB") },
                  { iso: "ES", label: getNomePais("ES") },
                  { iso: "FR", label: getNomePais("FR") },
                ].map((item) => (
                  <button
                    key={item.iso}
                    onClick={() => setPais(item.iso)}
                    className={`p-3.5 rounded-2xl border text-left font-semibold text-xs transition flex items-center justify-between ${
                      pais === item.iso
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">{item.iso}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs text-slate-400 mb-1">
                  Outro código de país (ISO com 2 letras)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={pais}
                  onChange={(e) => setPais(e.target.value.toUpperCase())}
                  placeholder="Ex: CA, DE, IT..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs uppercase font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* ETAPA 2: REGIÃO / ESTADO */}
          {etapa === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  Qual o seu estado ou região?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Opcional. Ajuda a filtrar instituições próximas a você.
                </p>
              </div>

              {pais === "BR" ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2 max-h-56 overflow-y-auto">
                  {UFS_BRASIL.map((uf) => (
                    <button
                      key={uf.sigla}
                      onClick={() => setRegiao(uf.sigla)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                        regiao === uf.sigla
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                      title={uf.nome}
                    >
                      {uf.sigla}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="pt-2">
                  <input
                    type="text"
                    value={regiao}
                    onChange={(e) => setRegiao(e.target.value)}
                    placeholder="Ex: Lisboa, Califórnia, Madrid..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* ETAPA 3: CIDADE */}
          {etapa === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  Em qual cidade você estuda?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Opcional. Você pode digitar ou pular direto para a busca de instituições.
                </p>
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Digite sua cidade (ex: Vitória, São Paulo...)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {cidadesSugeridas.length > 0 && (
                <div className="pt-1">
                  <p className="text-[11px] text-slate-500 mb-2">Cidades sugeridas:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {cidadesSugeridas.slice(0, 15).map((cid) => (
                      <button
                        key={cid}
                        onClick={() => setCidade(cid)}
                        className={`px-3 py-1 rounded-lg text-xs border transition ${
                          cidade === cid
                            ? "bg-indigo-600 border-indigo-500 text-white font-semibold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {cid}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 4: INSTITUIÇÃO */}
          {etapa === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-400" />
                  Selecione sua instituição
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">
                  Busque pelo nome, sigla ou apelido.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={buscaInstituicao}
                  onChange={(e) => setBuscaInstituicao(e.target.value)}
                  placeholder="Buscar escola ou universidade..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {carregandoInstituicoes ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Buscando instituições...
                  </div>
                ) : listaInstituicoes.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Nenhuma instituição encontrada com este filtro.
                  </div>
                ) : (
                  listaInstituicoes.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => setInstituicaoSelecionada(inst)}
                      className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        instituicaoSelecionada?.id === inst.id
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-white truncate">{inst.nome}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {inst.sigla ? `${inst.sigla} • ` : ""}
                          {inst.cidade ? `${inst.cidade} - ` : ""}
                          {inst.regiao || inst.pais} • {inst.tipo.toUpperCase()}
                        </p>
                      </div>
                      {instituicaoSelecionada?.id === inst.id && (
                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setModalCadastroManual(true)}
                  className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 rounded-xl text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  Não encontrei minha instituição (Cadastrar)
                </button>
                <button
                  type="button"
                  onClick={handleSelecionarAutodidata}
                  className="w-full py-2 px-3 text-slate-400 hover:text-slate-200 text-xs text-center transition"
                >
                  Sou autodidata / Não estudo em instituição
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 5: NÍVEL E CURSO / SÉRIE */}
          {etapa === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  Nível de ensino e curso
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configura o seu boletim, frequência e matérias recomendadas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nível de Ensino *
                </label>
                <select
                  value={nivelId}
                  onChange={(e) => setNivelId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecione seu nível...</option>
                  {niveisDisponiveis.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nome} {n.descricao ? `(${n.descricao})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Curso, Série ou Período *
                </label>
                <input
                  type="text"
                  value={cursoOuSerie}
                  onChange={(e) => setCursoOuSerie(e.target.value)}
                  placeholder="Ex: Informática para Internet, 3º Ano Médio, 4º Período..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* ETAPA 6: SISTEMAS (OPCIONAL) */}
          {etapa === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Conexões Institucionais (Opcional)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Deseja conectar os sistemas da sua escola agora ou prefere configurar depois?
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  {
                    id: "moodle",
                    nome: "Moodle da Instituição",
                    desc: "Importe suas tarefas, prazos e notas",
                  },
                  {
                    id: "google_classroom",
                    nome: "Google Classroom",
                    desc: "Sincronize turmas e trabalhos",
                  },
                  {
                    id: "calendario_ics",
                    nome: "Calendário Acadêmico (ICS)",
                    desc: "Prazos em tempo real",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{item.nome}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-medium">
                      Disponível nas Configurações
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ETAPA 7: RESUMO E CONSENTIMENTO */}
          {etapa === 7 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Resumo e Privacidade
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Confira suas preferências antes de começar a estudar.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Instituição:</span>
                  <span className="font-semibold text-white text-right">
                    {instituicaoSelecionada?.nome || "Não selecionada"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Local:</span>
                  <span className="font-semibold text-white">
                    {cidade ? `${cidade}, ` : ""}
                    {regiao || pais}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Curso / Série:</span>
                  <span className="font-semibold text-white">{cursoOuSerie || "Geral"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Escala de Notas:</span>
                  <span className="font-semibold text-indigo-300">
                    {getSistemaNotaPadraoPorPais(pais)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 leading-relaxed">
                <p className="font-semibold mb-0.5">Privacidade Garantida por Padrão</p>
                Sua instituição, série e curso são dados pessoais estritamente privados. Apenas você tem acesso. Você pode alterar ou remover sua instituição a qualquer momento em <strong>Configurações &gt; Instituição</strong> sem perder suas notas, moedas, XP ou matérias.
              </div>
            </div>
          )}
        </div>

        {/* Aviso Fixo Legal Obrigatório */}
        <div className="pt-4 border-t border-slate-800/80 mt-4">
          <p className="text-[10px] text-slate-500 text-center mb-3">
            Lista informativa. O Brain Studio não tem vínculo com as instituições listadas.
          </p>

          {/* Botões de Navegação */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (etapa > 1) setEtapa(etapa - 1);
                else if (onCancelar) onCancelar();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {etapa === 1 ? "Cancelar" : "Voltar"}
            </button>

            {etapa < 7 ? (
              <button
                type="button"
                onClick={() => {
                  if (etapa === 4 && !instituicaoSelecionada) {
                    alert("Por favor, selecione sua instituição ou clique em Autodidata.");
                    return;
                  }
                  setEtapa(etapa + 1);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
              >
                Próximo
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalizar}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
              >
                <Check className="w-3.5 h-3.5" />
                Concluir Onboarding
              </button>
            )}
          </div>
        </div>
      </div>

      {modalCadastroManual && (
        <CadastroManualModal
          paisIso={pais}
          regiaoPrevia={regiao}
          cidadePrevia={cidade}
          onClose={() => setModalCadastroManual(false)}
          onInstituicaoCadastrada={(novaInst) => {
            setInstituicaoSelecionada(novaInst);
            setModalCadastroManual(false);
            setEtapa(5);
          }}
        />
      )}
    </div>
  );
};
