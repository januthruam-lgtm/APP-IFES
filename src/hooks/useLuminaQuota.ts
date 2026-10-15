import { useCallback, useEffect, useState } from "react";
import { PLANS } from "../lib/plans";
import { isPro } from "../lib/billing";

type QuotaState = { day: string; used: number };

const KEY = "brain_studio_lumina_quota_v1";
const todayKey = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD local

function read(): QuotaState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return raw.day === todayKey() ? raw : { day: todayKey(), used: 0 };
  } catch {
    return { day: todayKey(), used: 0 };
  }
}

export function useLuminaQuota() {
  const [state, setState] = useState<QuotaState>(read);
  const [pro, setPro] = useState(false);

  useEffect(() => {
    isPro().then(setPro);
  }, []);

  const used = state.day === todayKey() ? state.used : 0;
  const limit = pro ? Infinity : PLANS.free.luminaDailyLimit;

  const consume = useCallback(() => {
    setState((prev) => {
      const base = prev.day === todayKey() ? prev : { day: todayKey(), used: 0 };
      const next = { ...base, used: base.used + 1 };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage cheio ou bloqueado */
      }
      return next;
    });
  }, []);

  return {
    pro,
    setPro,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    canAsk: pro || used < limit,
    consume,
  };
}