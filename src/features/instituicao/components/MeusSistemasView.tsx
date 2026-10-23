/**
 * Brain Studio - Meus Sistemas e Conexões Institucionais (Fase 7)
 * Painel completo para conectar Moodle, Google Classroom, Microsoft Teams,
 * Canvas, Calendários ICS e gerenciar Atalhos Web seguros.
 */

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Bookmark,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { CATALOGO_CONECTORES, ConectorConfig } from "../../../config/conectores.config";
import { SistemaConectadoUsuario, AtalhoWebInstitucional } from "../types";
import {
  conectarSistema,
  desconectarSistema,
  sincronizarSistema,
  carregarAtalhosUsuario,
  salvarAtalhoUsuario,
  removerAtalhoUsuario,
} from "../services/syncService";

export const MeusSistemasView: React.FC = () => {
  const [sistemas, setSistemas] = useState<SistemaConectadoUsuario[]>([]);
  const [atalhos, setAtalhos] = useState<AtalhoWebInstitucional[]>([]);
  const [modalConector, setModalConector] = useState<ConectorConfig | null>(null);
  const [modalAtalho, setModalAtalho] = useState(false);

  // Form de conexão
  const [nomeSistema, setNomeSistema] = useState("");
  const [urlSistema, setUrlSistema] = useState("");
  const [tokenPessoal, setTokenPessoal] = useState("");
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [sincronizandoId, setSincronizandoId] = useState<string | null>(null);

  // Form de novo atalho
  const [tituloAtalho, setTituloAtalho] = useState("");
  const [urlAtalho, setUrlAtalho] = useState("");
  const [categoriaAtalho, setCategoriaAtalho] = useState<AtalhoWebInstitucional["categoria"]>("portal");

  useEffect(() => {
    // Carrega atalhos locais
    setAtalhos(carregarAtalhosUsuario());

    // Carrega sistemas salvos localmente
    try {
      const raw = localStorage.getItem("brain_sistemas_conectados_v1");
      if (raw) {
        setSistemas(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const salvarListaSistemas = (novaLista: SistemaConectadoUsuario[]) => {
    setSistemas(novaLista);
    try {
      localStorage.setItem("brain_sistemas_conectados_v1", JSON.stringify(novaLista));
    } catch {}
  };

  const handleAbrirConector = (conector: ConectorConfig) => {
    setModalConector(conector);
    setNomeSistema(conector.nome);
    setUrlSistema("");
    setTokenPessoal("");
    setErroForm(null);
  };

  const handleSalvarConexao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalConector) return;
    setErroForm(null);
    setSalvando(true);

    try {
      const { sistemaId, payloadFirestore } = await conectarSistema(
        {
          conectorId: modalConector.id,
          nome: nomeSistema.trim() || modalConector.nome,
          tipo: modalConector.tipo,
          url: urlSistema.trim() || undefined,
        },
        tokenPessoal.trim() || undefined
      );

      const novoSistema: SistemaConectadoUsuario = {
        id: sistemaId,
        conectorId: modalConector.id,
        nome: nomeSistema.trim() || modalConector.nome,
        tipo: modalConector.tipo,
        url: urlSistema.trim() || undefined,
        status: "conectado",
        dataConexao: Date.now(),
        ultimaSincronizacao: Date.now(),
      };

      salvarListaSistemas([...sistemas, novoSistema]);
      setModalConector(null);
    } catch (err: any) {
      setErroForm(err.message || "Falha ao conectar o sistema institucional.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDesconectar = async (sistema: SistemaConectadoUsuario) => {
    if (confirm(`Deseja realmente desconectar ${sistema.nome}? As credenciais locais serão apagadas.`)) {
      await desconectarSistema(sistema.id);
      salvarListaSistemas(sistemas.filter((s) => s.id !== sistema.id));
    }
  };

  const handleSincronizar = async (sistema: SistemaConectadoUsuario) => {
    setSincronizandoId(sistema.id);
    try {
      const res = await sincronizarSistema(sistema);
      if (res.sucesso) {
        salvarListaSistemas(
          sistemas.map((s) =>
            s.id === sistema.id ? { ...s, ultimaSincronizacao: Date.now(), status: "conectado", erro: undefined } : s
          )
        );
      } else {
        salvarListaSistemas(
          sistemas.map((s) =>
            s.id === sistema.id ? { ...s, status: "erro", erro: res.mensagem } : s
          )
        );
      }
    } finally {
      setSincronizandoId(null);
    }
  };

  const handleSalvarNovoAtalho = (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm(null);

    const res = salvarAtalhoUsuario({
      titulo: tituloAtalho.trim(),
      url: urlAtalho.trim(),
      categoria: categoriaAtalho,
    });

    if (res.sucesso && res.atalho) {
      setAtalhos([...atalhos, res.atalho]);
      setTituloAtalho("");
      setUrlAtalho("");
      setModalAtalho(false);
    } else {
      setErroForm(res.mensagem || "Erro ao salvar atalho.");
    }
  };

  const handleRemoverAtalho = (id: string) => {
    removerAtalhoUsuario(id);
    setAtalhos(atalhos.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Aviso de Privacidade e Segurança */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <p className="font-semibold text-white mb-0.5">Segurança Máxima de Acesso</p>
          O Brain Studio <span className="font-bold underline">nunca</span> solicita ou guarda sua senha institucional. Suas chaves de conexão e tokens são protegidos por criptografia militar AES-GCM diretamente no seu aparelho e jamais enviados a nenhum servidor.
        </div>
      </div>

      {/* Sistemas Conectados */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            Sistemas Conectados ({sistemas.length})
          </h3>
        </div>

        {sistemas.length === 0 ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
            <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400 mb-1">Nenhum sistema institucional conectado ainda.</p>
            <p className="text-[11px] text-slate-500">
              Conecte o Moodle da sua escola, Google Classroom ou link ICS para importar suas tarefas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sistemas.map((sistema) => (
              <div
                key={sistema.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{sistema.nome}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                        sistema.status === "conectado"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {sistema.status === "conectado" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Conectado
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" /> Erro
                        </>
                      )}
                    </span>
                  </div>
                  {sistema.url && (
                    <p className="text-[11px] text-slate-400 truncate">{sistema.url}</p>
                  )}
                  {sistema.erro && (
                    <p className="text-[11px] text-red-400 mt-1">{sistema.erro}</p>
                  )}
                  {sistema.ultimaSincronizacao && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3" />
                      Última sincronização:{" "}
                      {new Date(sistema.ultimaSincronizacao).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleSincronizar(sistema)}
                    disabled={sincronizandoId === sistema.id}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        sincronizandoId === sistema.id ? "animate-spin text-indigo-400" : ""
                      }`}
                    />
                    Sincronizar agora
                  </button>
                  <button
                    onClick={() => handleDesconectar(sistema)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                    title="Desconectar e apagar chaves locais"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Catálogo de Conectores Disponíveis */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2">Conectar Novo Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Object.values(CATALOGO_CONECTORES).map((conector) => (
            <button
              key={conector.id}
              onClick={() => handleAbrirConector(conector)}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition">
                <Plus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{conector.nome}</p>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {conector.oQueImporta.join(", ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Atalhos Web Institucionais */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              Atalhos Web Institucionais ({atalhos.length}/30)
            </h3>
            <p className="text-[11px] text-slate-400">
              Acesse portais acadêmicos, biblioteca virtual ou financeiro com 1 clique seguro.
            </p>
          </div>
          <button
            onClick={() => setModalAtalho(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Atalho
          </button>
        </div>

        {atalhos.length === 0 ? (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
            Nenhum atalho institucional cadastrado ainda.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {atalhos.map((atalho) => (
              <div
                key={atalho.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 group hover:border-slate-700 transition"
              >
                <a
                  href={atalho.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 flex items-center gap-2 text-xs font-medium text-white hover:text-indigo-400 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-indigo-400" />
                  <span className="truncate">{atalho.titulo}</span>
                </a>
                <button
                  onClick={() => handleRemoverAtalho(atalho.id)}
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition opacity-0 group-hover:opacity-100"
                  title="Excluir atalho"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Configuração do Conector */}
      {modalConector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-1">
              Conectar {modalConector.nome}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{modalConector.comoConfigurar}</p>

            {erroForm && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{erroForm}</span>
              </div>
            )}

            <form onSubmit={handleSalvarConexao} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Conexão
                </label>
                <input
                  type="text"
                  required
                  value={nomeSistema}
                  onChange={(e) => setNomeSistema(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {modalConector.requerUrl && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Oficial (https://)
                  </label>
                  <input
                    type="url"
                    required
                    value={urlSistema}
                    onChange={(e) => setUrlSistema(e.target.value)}
                    placeholder="https://moodle.escola.edu.br"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Apenas conexões HTTPS legítimas são autorizadas.
                  </p>
                </div>
              )}

              {modalConector.metodoAutenticacao === "token_pessoal" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chave Pessoal de Acesso / Token
                  </label>
                  <input
                    type="password"
                    required
                    value={tokenPessoal}
                    onChange={(e) => setTokenPessoal(e.target.value)}
                    placeholder="Cole seu token gerado nas preferências"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    🔒 Criptografado no dispositivo. Jamais armazenado no Firestore ou servidores.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalConector(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : "Salvar Conexão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Novo Atalho Web */}
      {modalAtalho && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-100">
            <h3 className="text-sm font-bold text-white mb-3">Novo Atalho Web</h3>

            {erroForm && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg">
                {erroForm}
              </div>
            )}

            <form onSubmit={handleSalvarNovoAtalho} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Atalho
                </label>
                <input
                  type="text"
                  required
                  value={tituloAtalho}
                  onChange={(e) => setTituloAtalho(e.target.value)}
                  placeholder="Ex: Portal Acadêmico"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL (https://)
                </label>
                <input
                  type="url"
                  required
                  value={urlAtalho}
                  onChange={(e) => setUrlAtalho(e.target.value)}
                  placeholder="https://academico.escola.edu.br"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAtalho(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
