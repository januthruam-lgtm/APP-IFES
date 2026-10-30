import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Castle, Sparkles } from "lucide-react";
import { UserProfile } from "../../types";
import { CIDADES_DATA, obterCidadePorId } from "../../features/cidade/data/cidadesData";
import {
  EstadoCidadeUsuario,
  carregarEstadoCidade,
  evoluirConstrucao,
  trocarCidadeAtiva,
  calcularProgressoCidade,
} from "../../features/cidade/services/cidadeService";
import {
  tocarSomConstruir,
  tocarSomCompletarCidade,
  tocarSomClique,
  isAudioHabilitado,
  alternarAudioCidade,
} from "../../features/cidade/utils/cidadeAudio";
import { CenarioMundoCidade } from "../../features/cidade/components/CenarioMundoCidade";
import { HudCidade } from "../../features/cidade/components/HudCidade";
import { CelebracaoConclusaoModal } from "../../features/cidade/components/CelebracaoConclusaoModal";
import { CidadeInfoModal } from "../../features/cidade/components/CidadeInfoModal";

interface CidadeDoConhecimentoTabProps {
  user: UserProfile;
  onRewardCoins?: (amount: number) => void;
  onRewardXp?: (amount: number) => void;
  onConsumeCoins?: (amount: number) => void;
}

export const CidadeDoConhecimentoTab: React.FC<CidadeDoConhecimentoTabProps> = ({
  user,
  onRewardCoins,
  onRewardXp,
  onConsumeCoins,
}) => {
  const userId = user.id || user.uid || "local-user";

  const [estado, setEstado] = useState<EstadoCidadeUsuario | null>(null);
  const [cidadeIdAtiva, setCidadeIdAtiva] = useState<number>(1);
  const [construcaoEmEvolucao, setConstrucaoEmEvolucao] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [somAtivo, setSomAtivo] = useState<boolean>(isAudioHabilitado());
  const [modalVitoria, setModalVitoria] = useState<{ cidadeId: number; proximaId?: number } | null>(null);
  const [modalInfoAberto, setModalInfoAberto] = useState<boolean>(false);
  const [notificacao, setNotificacao] = useState<{ texto: string; tipo: "sucesso" | "erro" | "info" } | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState<boolean>(false);

  // Moedas ativas do estudante (prioriza saldo em tempo real)
  const saldoMoedasAtual = user.coins ?? 250;

  useEffect(() => {
    carregarEstadoCidade(userId).then((res) => {
      setEstado(res);
      setCidadeIdAtiva(res.cidadeAtual || 1);
      setCarregando(false);
    });
  }, [userId]);

  const exibirNotificacao = (texto: string, tipo: "sucesso" | "erro" | "info" = "info") => {
    setNotificacao({ texto, tipo });
    setTimeout(() => {
      setNotificacao(null);
    }, 3200);
  };

  const handleAlternarSom = () => {
    const novoStatus = alternarAudioCidade();
    setSomAtivo(novoStatus);
  };

  const handleMudarCidade = async (novaId: number) => {
    if (!estado || processandoAcao) return;
    tocarSomClique();

    const cidadeAlvo = obterCidadePorId(novaId);
    const desbloqueada = novaId === 1 || estado.cidadesCompletadas.includes(novaId - 1);

    if (!desbloqueada) {
      exibirNotificacao(`A ${cidadeAlvo.nome} está bloqueada. Complete todas as estrelas da vila anterior.`, "info");
      return;
    }

    try {
      const novo = await trocarCidadeAtiva(userId, novaId);
      setEstado(novo);
      setCidadeIdAtiva(novaId);
    } catch (err: any) {
      exibirNotificacao(err.message || "Não foi possível alternar de vila.", "erro");
    }
  };

  const handleConstruir = async (monumentoId: string) => {
    if (processandoAcao || !estado) return;

    setProcessandoAcao(true);
    setConstrucaoEmEvolucao(monumentoId);

    // Efeito sonoro sincronizado com marteladas e serrote
    tocarSomConstruir();

    try {
      const res = await evoluirConstrucao(userId, monumentoId, saldoMoedasAtual);

      if (res.sucesso) {
        setEstado(res.novoEstado);
        if (onConsumeCoins) onConsumeCoins(res.custoMoedas);
        if (onRewardXp) onRewardXp(res.xpGanho);

        confetti({
          particleCount: res.cidadeCompletou ? 120 : 45,
          spread: res.cidadeCompletou ? 130 : 65,
          origin: { y: 0.6 },
        });

        if (res.cidadeCompletou) {
          tocarSomCompletarCidade();
          const cidadeAtual = obterCidadePorId(cidadeIdAtiva);
          if (onRewardCoins) onRewardCoins(cidadeAtual.recompensaConclusao.moedas);
          if (onRewardXp) onRewardXp(cidadeAtual.recompensaConclusao.xp);

          const proximaId = cidadeIdAtiva < CIDADES_DATA.length ? cidadeIdAtiva + 1 : undefined;
          setModalVitoria({
            cidadeId: cidadeIdAtiva,
            proximaId,
          });
        }
      } else {
        exibirNotificacao(res.mensagem, "erro");
      }
    } catch (err) {
      exibirNotificacao("Ocorreu um erro ao processar a obra.", "erro");
    } finally {
      // Duração da animação de obra (1.35s)
      setTimeout(() => {
        setConstrucaoEmEvolucao(null);
        setProcessandoAcao(false);
      }, 1350);
    }
  };

  if (carregando || !estado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-3">
        <Castle className="w-12 h-12 text-amber-500 animate-bounce" />
        <p className="text-sm font-bold text-[var(--app-text)]">Construindo sua Cidade do Conhecimento...</p>
        <p className="text-xs text-[var(--app-text-muted)]">Carregando cenários, relevos e monumentos acadêmicos.</p>
      </div>
    );
  }

  const cidadeAtual = obterCidadePorId(cidadeIdAtiva);
  const progresso = calcularProgressoCidade(estado, cidadeAtual.id);

  return (
    <div className="relative w-full max-w-6xl mx-auto pb-12 select-none animate-in fade-in duration-200">
      {/* Toast de Notificação Discreto */}
      {notificacao && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-black flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 ${
            notificacao.tipo === "sucesso"
              ? "bg-emerald-600 text-white border-emerald-400"
              : notificacao.tipo === "erro"
              ? "bg-rose-600 text-white border-rose-400"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          <span>{notificacao.texto}</span>
        </div>
      )}

      {/* Cenário Principal da Cidade com HUD Sobreposto */}
      <div className="relative w-full rounded-3xl overflow-hidden">
        {/* HUD de Jogo Móvel Limpo e Elegante (Top Bar) */}
        <HudCidade
          cidade={cidadeAtual}
          totalCidades={CIDADES_DATA.length}
          cidadesCompletadas={estado.cidadesCompletadas}
          saldoMoedas={saldoMoedasAtual}
          totalEstrelas={progresso.concluidos}
          maxEstrelas={progresso.total}
          somHabilitado={somAtivo}
          onAlternarSom={handleAlternarSom}
          onMudarCidade={handleMudarCidade}
          onAbrirInfo={() => setModalInfoAberto(true)}
        />

        {/* O Cenário com os Monumentos Diretamente Integrados na Paisagem */}
        <CenarioMundoCidade
          cidade={cidadeAtual}
          construcoesNiveis={estado.construcoes}
          construcaoEmEvolucao={construcaoEmEvolucao}
          saldoMoedas={saldoMoedasAtual}
          onConstruir={handleConstruir}
        />
      </div>

      {/* Modal Comemorativo de Vila Conquistada (Todas as 5 Obras no Nível 5) */}
      {modalVitoria && (
        <CelebracaoConclusaoModal
          cidade={obterCidadePorId(modalVitoria.cidadeId)}
          proximaCidadeId={modalVitoria.proximaId}
          onAvancar={() => {
            const prox = modalVitoria.proximaId;
            setModalVitoria(null);
            if (prox) {
              handleMudarCidade(prox);
            }
          }}
          onFechar={() => setModalVitoria(null)}
        />
      )}

      {/* Modal de Informações Temáticas & Lore da Cidade */}
      {modalInfoAberto && (
        <CidadeInfoModal
          cidade={cidadeAtual}
          onFechar={() => setModalInfoAberto(false)}
        />
      )}
    </div>
  );
};
