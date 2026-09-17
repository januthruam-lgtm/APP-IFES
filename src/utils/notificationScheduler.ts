import {
  StrictNotificationTrigger,
  LeadTimePreset,
  StrictNotificationPreferences,
  ScheduledDeadlineItem,
  TaskItem,
} from "../types";

const STORAGE_KEY = "brain_studio_strict_notification_prefs_v1";

export const DEFAULT_NOTIFICATION_PREFERENCES: StrictNotificationPreferences = {
  enabled: true,
  enableNewContent: true, // Gatilho 1: Novo Conteúdo AVA IFES
  enableTeamMessages: true, // Gatilho 2: Nova Mensagem na Equipe (Sala Virtual)
  enableDeadlines: true, // Gatilho 3: Prazos Próximos do Fim
  leadTimePreset: "1h",
  customLeadTimeValue: 1,
  customLeadTimeUnit: "hours",
  webPushSubscribed: false,
};

export const LEAD_TIME_PRESETS: { id: LeadTimePreset; label: string; minutes: number }[] = [
  { id: "15m", label: "15 minutos antes", minutes: 15 },
  { id: "1h", label: "1 hora antes", minutes: 60 },
  { id: "3h", label: "3 horas antes", minutes: 180 },
  { id: "1d", label: "1 dia antes (24h)", minutes: 1440 },
  { id: "2d", label: "2 dias antes (48h)", minutes: 2880 },
  { id: "custom", label: "Personalizado...", minutes: 0 },
];

/**
 * Obtém as preferências salvas no localStorage ou valores padrão
 */
export const getNotificationPreferences = (): StrictNotificationPreferences => {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed };
    }
  } catch (err) {
    console.warn("Erro ao ler preferências de notificação:", err);
  }
  return DEFAULT_NOTIFICATION_PREFERENCES;
};

/**
 * Salva as preferências de notificação
 */
export const saveNotificationPreferences = (
  prefs: StrictNotificationPreferences
): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(
      new CustomEvent("brainstudio:notifications-updated", { detail: prefs })
    );
  } catch (err) {
    console.warn("Erro ao salvar preferências de notificação:", err);
  }
};

/**
 * Calcula o tempo de antecedência (lead time) em minutos
 */
export const calculateLeadTimeMinutes = (
  prefs: StrictNotificationPreferences
): number => {
  switch (prefs.leadTimePreset) {
    case "15m":
      return 15;
    case "1h":
      return 60;
    case "3h":
      return 180;
    case "1d":
      return 1440;
    case "2d":
      return 2880;
    case "custom": {
      const val = Math.max(1, prefs.customLeadTimeValue || 1);
      return prefs.customLeadTimeUnit === "days" ? val * 1440 : val * 60;
    }
    default:
      return 60;
  }
};

/**
 * Retorna texto amigável do intervalo configurado
 */
export const getLeadTimeLabel = (
  prefs: StrictNotificationPreferences
): string => {
  if (prefs.leadTimePreset === "custom") {
    const val = prefs.customLeadTimeValue || 1;
    const unit =
      prefs.customLeadTimeUnit === "days"
        ? val === 1
          ? "dia"
          : "dias"
        : val === 1
        ? "hora"
        : "horas";
    return `${val} ${unit} antes (personalizado)`;
  }
  const found = LEAD_TIME_PRESETS.find((p) => p.id === prefs.leadTimePreset);
  return found ? found.label : "1 hora antes";
};

/**
 * Solicita permissão da Notification API nativa
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Tenta subscrever no Web Push caso o Service Worker esteja pronto
      subscribeToWebPush().catch((e) =>
        console.warn("Auto-subscrevendo ao Web Push:", e)
      );
    }
    return permission;
  } catch (err) {
    console.warn("Erro ao solicitar permissão de notificação:", err);
    return "denied";
  }
};

/**
 * Envia notificação estrita garantindo conformidade com os 3 gatilhos permitidos
 */
export const triggerStrictNotification = async (
  trigger: StrictNotificationTrigger,
  options: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
  }
): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  const prefs = getNotificationPreferences();
  if (!prefs.enabled) return false;

  // Validação estrita por categoria de disparo
  if (trigger === "new_content" && !prefs.enableNewContent) return false;
  if (trigger === "team_message" && !prefs.enableTeamMessages) return false;
  if (trigger === "deadline_approaching" && !prefs.enableDeadlines) return false;

  // Verifica permissão no navegador
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  try {
    // 1. Tenta delegar ao Service Worker (ideal para PWA e background)
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.active) {
        reg.active.postMessage({
          type: "DISPATCH_STRICT_NOTIFICATION",
          notifType: trigger,
          title: options.title,
          body: options.body,
          url: options.url,
          tag: options.tag,
        });
        return true;
      }
    }

    // 2. Fallback direto via Notification API de janela
    const notification = new Notification(options.title, {
      body: options.body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: options.tag || `bs-${trigger}-${Date.now()}`,
      data: { url: options.url || "/", type: trigger },
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.url) {
        window.location.href = options.url;
      }
    };

    return true;
  } catch (err) {
    console.warn("Erro ao disparar notificação estrita:", err);
    return false;
  }
};

/**
 * Agendamento Dinâmico de Prazos:
 * Calcula o horário exato do alerta subtraindo o Lead Time selecionado
 * e despacha a lista atualizada para o Service Worker e backend.
 */
export const syncDeadlinesWithServiceWorker = async (
  tasks: TaskItem[],
  assignments: { id: string; title: string; dueDate?: string; courseName?: string }[] = [],
  customPrefs?: StrictNotificationPreferences
): Promise<ScheduledDeadlineItem[]> => {
  const prefs = customPrefs || getNotificationPreferences();
  if (!prefs.enabled || !prefs.enableDeadlines) {
    // Se prazos desativados, limpa agendamentos no SW
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.active) {
        reg.active.postMessage({
          type: "SCHEDULE_DYNAMIC_DEADLINES",
          deadlines: [],
        });
      }
    }
    return [];
  }

  const leadTimeMinutes = calculateLeadTimeMinutes(prefs);
  const leadTimeMs = leadTimeMinutes * 60 * 1000;
  const now = Date.now();
  const scheduledList: ScheduledDeadlineItem[] = [];

  // 1. Processa tarefas do Organizador de Tarefas
  for (const t of tasks) {
    if (t.completed || !t.dueDate) continue;

    // Converte dueDate (YYYY-MM-DD) e dueTime (HH:mm) para timestamp
    let timeStr = t.dueTime || "23:59";
    const dateObj = new Date(`${t.dueDate}T${timeStr}:00`);
    if (isNaN(dateObj.getTime())) continue;

    const dueTimestamp = dateObj.getTime();
    const alertTimestamp = dueTimestamp - leadTimeMs;

    // Agenda se o prazo ainda não expirou
    if (dueTimestamp > now) {
      scheduledList.push({
        id: `task-${t.id}`,
        taskName: t.title,
        title: `Prazo Próximo do Fim ⏰`,
        body: `Atenção: A tarefa "${t.title}" vence ${t.dueDate} às ${timeStr} (${getLeadTimeLabel(
          prefs
        )}).`,
        dueTimestamp,
        alertTimestamp,
        leadTimeMinutes,
        url: "/?tab=tasks",
      });
    }
  }

  // 2. Processa tarefas/entregas sincronizadas do AVA IFES
  for (const a of assignments) {
    if (!a.dueDate) continue;

    let dueTimestamp: number;
    if (a.dueDate.includes("T")) {
      dueTimestamp = new Date(a.dueDate).getTime();
    } else {
      dueTimestamp = new Date(`${a.dueDate}T23:59:00`).getTime();
    }
    if (isNaN(dueTimestamp) || dueTimestamp <= now) continue;

    const alertTimestamp = dueTimestamp - leadTimeMs;

    scheduledList.push({
      id: `ava-${a.id}`,
      taskName: a.title,
      title: `Prazo do AVA IFES se Aproximando ⚠️`,
      body: `Trabalho "${a.title}" (${a.courseName || "IFES"}) vence em breve (${getLeadTimeLabel(
        prefs
      )}).`,
      dueTimestamp,
      alertTimestamp,
      leadTimeMinutes,
      url: "/?tab=tasks",
    });
  }

  // 3. Envia para o Service Worker
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.active) {
        reg.active.postMessage({
          type: "SCHEDULE_DYNAMIC_DEADLINES",
          deadlines: scheduledList,
        });
      }
    } catch (swErr) {
      console.warn("Falha ao comunicar com Service Worker:", swErr);
    }
  }

  // 4. Salva localmente para verificação reativa da aba ativa
  try {
    localStorage.setItem(
      "brain_studio_scheduled_deadlines",
      JSON.stringify(scheduledList)
    );
  } catch (e) {
    // ignore
  }

  // 5. Registra no backend Web Push para entrega mesmo com navegador fechado
  try {
    fetch("/api/push/schedule-deadlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deadlines: scheduledList,
        leadTimeMinutes,
      }),
    }).catch(() => {
      // Offline fallback gracioso
    });
  } catch (err) {
    // ignore
  }

  return scheduledList;
};

// Conversor de chave VAPID base64url para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscrição ao Web Push da aplicação
 */
export const subscribeToWebPush = async (): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> => {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return { success: false, error: "Web Push não suportado neste navegador." };
  }

  try {
    // 1. Busca chave pública do VAPID no servidor
    const res = await fetch("/api/push/vapid-public-key");
    if (!res.ok) {
      throw new Error("Não foi possível obter chave pública VAPID do servidor.");
    }
    const { publicKey } = await res.json();
    if (!publicKey) {
      throw new Error("Chave VAPID vazia recebida.");
    }

    // 2. Aguarda registro do Service Worker
    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    // 3. Se não tiver subscrição, cria nova
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });
    }

    // 4. Envia para o backend para salvar
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    // Atualiza estado local
    const current = getNotificationPreferences();
    saveNotificationPreferences({ ...current, webPushSubscribed: true });

    return { success: true, subscription };
  } catch (err: any) {
    console.warn("Erro ao configurar Web Push:", err);
    return { success: false, error: err.message || "Falha na subscrição Web Push" };
  }
};
