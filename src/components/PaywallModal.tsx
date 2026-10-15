import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Crown, Check, X } from "lucide-react";
import {
  PACKAGE_TYPE,
  type PurchasesPackage,
} from "@revenuecat/purchases-capacitor";
import { PLANS, FALLBACK_PRICES } from "../lib/plans";
import { getOffering, buy, restore } from "../lib/billing";

type PaywallModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
};

export default function PaywallModal({ isOpen, onClose, onUnlocked }: PaywallModalProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    setError("");
    getOffering()
      .then((offering) => {
        if (!alive || !offering) return;
        setPackages(offering.availablePackages || []);
        const preferred = offering.annual || offering.availablePackages?.[0];
        setSelectedId(preferred?.identifier ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selected = packages.find((p) => p.identifier === selectedId);

  const handleBuy = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const ok = await buy(selected);
      if (ok) onUnlocked?.();
    } catch (e) {
      const err = e as { userCancelled?: boolean };
      if (!err?.userCancelled) {
        setError("Não foi possível concluir a compra. Tente novamente.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    setError("");
    try {
      const ok = await restore();
      if (ok) onUnlocked?.();
      else setError("Nenhuma assinatura ativa encontrada nesta conta Google.");
    } catch {
      setError("Não foi possível restaurar agora.");
    } finally {
      setBusy(false);
    }
  };

  const labelFor = (p: PurchasesPackage) =>
    p.packageType === PACKAGE_TYPE.ANNUAL
      ? "Anual"
      : p.packageType === PACKAGE_TYPE.MONTHLY
      ? "Mensal"
      : p.product.title;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md max-h-full flex flex-col bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-2xl text-[var(--app-text)] overflow-hidden"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-[var(--app-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black">{PLANS.pro.name}</h2>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Você atingiu o limite diário da Lumina
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-xl hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-5 space-y-5">
          <ul className="space-y-2">
            {PLANS.pro.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-xs">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {packages.length > 0 ? (
            <div className="space-y-2.5">
              {packages.map((p) => {
                const active = p.identifier === selectedId;
                return (
                  <button
                    key={p.identifier}
                    onClick={() => setSelectedId(p.identifier)}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition ${
                      active
                        ? "border-[var(--app-primary)] bg-[var(--app-primary)]/10"
                        : "border-[var(--app-border)] bg-[var(--app-card-secondary)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black">{labelFor(p)}</span>
                      <span className="text-xs font-bold text-[var(--app-primary)]">
                        {p.product.priceString}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[11px] text-[var(--app-text-muted)] space-y-1">
              <p className="font-bold text-[var(--app-text)] text-xs">
                {FALLBACK_PRICES.monthly} · {FALLBACK_PRICES.annual}
              </p>
              <p>A assinatura fica disponível no app instalado pela Google Play.</p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-[11px] font-bold text-red-500">
              {error}
            </p>
          )}

          <p className="text-[10px] text-[var(--app-text-muted)] leading-snug">
            A assinatura renova automaticamente e pode ser cancelada a qualquer
            momento na Google Play. Ao assinar, você concorda com os termos de uso e
            com a{" "}
            <a href="/privacidade.html" className="underline">
              política de privacidade
            </a>
            .
          </p>
        </div>

        {/* Rodapé fixo */}
        <div className="px-5 py-3.5 border-t border-[var(--app-border)] flex flex-col gap-2 shrink-0">
          <button
            disabled={busy || !selected}
            onClick={handleBuy}
            className={`w-full py-2.5 rounded-xl font-black text-xs transition ${
              selected && !busy
                ? "bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white shadow-md"
                : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] border border-[var(--app-border)] cursor-not-allowed"
            }`}
          >
            {busy ? "Processando..." : "Assinar o Pro"}
          </button>
          <div className="flex items-center justify-between">
            <button
              onClick={handleRestore}
              disabled={busy}
              className="text-[11px] font-bold text-[var(--app-text-muted)] underline"
            >
              Restaurar compras
            </button>
            <button
              onClick={onClose}
              className="text-[11px] font-bold text-[var(--app-text-muted)]"
            >
              Agora não
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}