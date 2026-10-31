import React, { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  Filter,
  User,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { CardTradeProposal, UserCardInventory } from "../types";
import { CARDS_MAP, COLLECTIONS_DATA } from "../data/cardsData";
import {
  createCommunityTrade,
  fetchCommunityTrades,
} from "../services/cardService";

interface CardTradeMarketViewProps {
  userUid?: string;
  userName?: string;
  userCampus?: string;
  inventory: UserCardInventory;
  onUpdateInventory: (newInv: UserCardInventory) => void;
  onBackToAlbum: () => void;
}

export const CardTradeMarketView: React.FC<CardTradeMarketViewProps> = ({
  userUid = "meu_id",
  userName = "Estudante IFES",
  userCampus = "Campus Vitória",
  inventory,
  onUpdateInventory,
  onBackToAlbum,
}) => {
  const [proposals, setProposals] = useState<CardTradeProposal[]>([]);
  const [filterType, setFilterType] = useState<"todas" | "posso_trocar" | "minhas">("todas");
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);

  // Seleções para criar nova proposta
  const [selectedOfferCardId, setSelectedOfferCardId] = useState<string>("");
  const [selectedRequestCardId, setSelectedRequestCardId] = useState<string>("");

  useEffect(() => {
    fetchCommunityTrades().then(setProposals);
  }, []);

  // Lista de cartas repetidas do jogador (count > 1) que podem ser ofertadas
  const myDuplicates = Object.keys(inventory.cards)
    .filter((id) => (inventory.cards[id] || 0) > 1)
    .map((id) => ({ card: CARDS_MAP[id], count: inventory.cards[id] }));

  // Lista de cartas faltantes no álbum do jogador
  const myMissingCards = Object.values(CARDS_MAP).filter(
    (c) => (inventory.cards[c.id] || 0) === 0
  );

  // Criar proposta de troca
  const handleCreateProposal = async () => {
    if (!selectedOfferCardId || !selectedRequestCardId) {
      alert("Selecione a carta que deseja ofertar e a carta que deseja receber.");
      return;
    }

    const offerCard = CARDS_MAP[selectedOfferCardId];
    const isGolden = Boolean(offerCard?.isGolden);

    await createCommunityTrade(
      userUid,
      userName,
      userCampus,
      "🎓",
      selectedOfferCardId,
      selectedRequestCardId,
      isGolden
    );

    // Recarrega propostas
    const updated = await fetchCommunityTrades();
    setProposals(updated);
    setIsNewProposalModalOpen(false);
    setSelectedOfferCardId("");
    setSelectedRequestCardId("");
  };

  // Aceitar proposta existente
  const handleAcceptProposal = (proposal: CardTradeProposal) => {
    // Verifica se o jogador possui a carta requisitada
    const hasRequested = (inventory.cards[proposal.requestedCardId] || 0) >= 1;
    if (!hasRequested) {
      alert("Você não possui a carta que este aluno está buscando.");
      return;
    }

    // Executa a troca: remove 1 da requisitada e adiciona 1 da ofertada
    const nextCards = { ...inventory.cards };
    nextCards[proposal.requestedCardId] = (nextCards[proposal.requestedCardId] || 1) - 1;
    nextCards[proposal.offeredCardId] = (nextCards[proposal.offeredCardId] || 0) + 1;

    const updatedInventory: UserCardInventory = {
      ...inventory,
      cards: nextCards,
    };

    onUpdateInventory(updatedInventory);

    // Atualiza status da proposta localmente
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposal.id
          ? { ...p, status: "aceita", acceptedByUid: userUid, acceptedByName: userName }
          : p
      )
    );

    alert(`🎉 Troca concluída com sucesso com ${proposal.senderName}!`);
  };

  const filteredProposals = proposals.filter((p) => {
    if (filterType === "minhas") return p.senderUid === userUid;
    if (filterType === "posso_trocar") {
      const iHaveWhatTheyWant = (inventory.cards[p.requestedCardId] || 0) > 1;
      const iNeedWhatTheyOffer = (inventory.cards[p.offeredCardId] || 0) === 0;
      return iHaveWhatTheyWant && iNeedWhatTheyOffer;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER DO MERCADO DE TROCAS */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Mercado de Trocas IFES</h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black">
              SEGURO & VERIFICADO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Negocie cartas repetidas com outros estudantes de todos os campi do Instituto Federal.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onBackToAlbum}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
          >
            ← Voltar ao Álbum
          </button>

          <button
            onClick={() => setIsNewProposalModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Oferta</span>
          </button>
        </div>
      </div>

      {/* BANNER EVENTO GOLDEN TRADE */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-bounce">✨🏆</div>
          <div>
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
              Golden Trade Especial Ativo
            </h4>
            <p className="text-[11px] text-slate-300">
              Durante o Festival, trocas de cartas douradas específicas estão liberadas com taxa zero!
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/40 whitespace-nowrap">
          LIBERADO
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType("todas")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === "todas"
              ? "bg-white text-slate-950"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Todas as Ofertas ({proposals.length})
        </button>
        <button
          onClick={() => setFilterType("posso_trocar")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === "posso_trocar"
              ? "bg-white text-slate-950"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Perfeitas para Mim 🎯
        </button>
        <button
          onClick={() => setFilterType("minhas")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === "minhas"
              ? "bg-white text-slate-950"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Minhas Ofertas
        </button>
      </div>

      {/* LISTA DAS PROPOSTAS DA COMUNIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProposals.map((trade) => {
          const offered = CARDS_MAP[trade.offeredCardId];
          const requested = CARDS_MAP[trade.requestedCardId];
          const isMyOwn = trade.senderUid === userUid;
          const iHaveRequested = (inventory.cards[trade.requestedCardId] || 0) >= 1;
          const isClosed = trade.status !== "aberta";

          return (
            <div
              key={trade.id}
              className={`p-4 rounded-3xl bg-slate-900 border ${
                trade.isGoldenTrade ? "border-amber-500/50" : "border-slate-800"
              } shadow-lg flex flex-col justify-between`}
            >
              {/* Header do Estudante Ofertante */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm">
                    {trade.senderAvatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{trade.senderName}</h4>
                    <p className="text-[10px] text-slate-400">{trade.senderCampus}</p>
                  </div>
                </div>

                {trade.isGoldenTrade && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-black border border-amber-400/30">
                    DOURADA
                  </span>
                )}
              </div>

              {/* Comparativo de Cartas: Oferece vs Busca */}
              <div className="grid grid-cols-2 gap-2 my-2 text-center">
                {/* Carta Ofertada */}
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Ele(a) Oferece:
                  </span>
                  <div className="text-2xl my-1">{offered?.emoji || "🃏"}</div>
                  <h5 className="font-extrabold text-xs text-white truncate max-w-full">
                    {offered?.name || "Carta"}
                  </h5>
                  <span className="text-[9px] text-emerald-300 font-semibold uppercase mt-0.5">
                    {offered?.rarity}
                  </span>
                </div>

                {/* Carta Solicitada */}
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    Ele(a) Quer:
                  </span>
                  <div className="text-2xl my-1">{requested?.emoji || "🃏"}</div>
                  <h5 className="font-extrabold text-xs text-white truncate max-w-full">
                    {requested?.name || "Carta"}
                  </h5>
                  <span className="text-[9px] text-cyan-300 font-semibold uppercase mt-0.5">
                    {requested?.rarity}
                  </span>
                </div>
              </div>

              {/* Botão de Troca ou Status */}
              <div className="mt-3 pt-2 border-t border-slate-800">
                {isClosed ? (
                  <div className="w-full py-2 rounded-xl bg-slate-800/60 text-slate-400 text-xs font-bold text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Troca Concluída</span>
                  </div>
                ) : isMyOwn ? (
                  <div className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold text-center">
                    Sua Proposta (Aguardando Aluno)
                  </div>
                ) : (
                  <button
                    disabled={!iHaveRequested}
                    onClick={() => handleAcceptProposal(trade)}
                    className={`w-full py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                      iHaveRequested
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-md shadow-emerald-500/20 active:scale-95"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{iHaveRequested ? "Trocar Agora!" : "Você Não Possui a Carta"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PARA CRIAR NOVA PROPOSTA */}
      {isNewProposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-white mb-2">Criar Oferta de Troca</h3>
            <p className="text-xs text-slate-400 mb-5">
              Escolha uma de suas cartas repetidas para oferecer e selecione a carta que deseja receber em troca.
            </p>

            {myDuplicates.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Você ainda não possui cartas repetidas para ofertar. Abra pacotes ou jogue minigames para obter cópias adicionais!
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Selecionar Carta Repetida para Ofertar */}
                <div>
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                    1. Qual carta repetida você quer dar?
                  </label>
                  <select
                    value={selectedOfferCardId}
                    onChange={(e) => setSelectedOfferCardId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Selecione uma carta repetida...</option>
                    {myDuplicates.map(({ card, count }) => (
                      <option key={card.id} value={card.id}>
                        {card.name} ({card.rarity.toUpperCase()}) • Você tem {count} cópias
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Selecionar Carta que Deseja Receber */}
                <div>
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                    2. Qual carta você quer receber em troca?
                  </label>
                  <select
                    value={selectedRequestCardId}
                    onChange={(e) => setSelectedRequestCardId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Selecione uma carta que lhe falta...</option>
                    {myMissingCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} ({card.rarity.toUpperCase()} • {card.collectionName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsNewProposalModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateProposal}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20"
                  >
                    Publicar no Mural
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
