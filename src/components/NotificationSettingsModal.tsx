import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  BookOpen,
  MessageSquare,
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  LeadTimePreset,
  StrictNotificationPreferences,
  TaskItem,
} from "../types";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  LEAD_TIME_PRESETS,
  calculateLeadTimeMinutes,
  getLeadTimeLabel,
  requestNotificationPermission,
  triggerStrictNotification,
  syncDeadlinesWithServiceWorker,
  subscribeToWebPush,
} from "../utils/notificationScheduler";

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks?: TaskItem[];
  assignments?: { id: string; title: string; dueDate?: string; courseName?: string }[];
  onPreferencesSaved?: (prefs: StrictNotificationPreferences) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  tasks = [],
  assignments = [],
  onPreferencesSaved,
}) => {
  const [prefs, setPrefs] = useState<StrictNotificationPreferences>(getNotificationPreferences());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [testSentToast, setTestSentToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPrefs(getNotificationPreferences());
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermissionStatus(Notification.permission);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    const perm = await requestNotificationPermission();
    setPermissionStatus(perm);
    setIsRequestingPermission(false);
    if (perm === "granted") {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    saveNotificationPreferences(prefs);
    await syncDeadlinesWithServiceWorker(tasks, assignments, prefs);

    if (onPreferencesSaved) {
      onPreferencesSaved(prefs);
    }

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 400);
  };

  // Testes práticos para os 3 gatilhos estritos autorizados
  const handleTestTrigger = async (
    type: "new_content" | "team_message" | "deadline_approaching"
  ) => {
    if (permissionStatus !== "granted") {
      const perm = await requestNotificationPermission();
      setPermissionStatus(perm);
      if (perm !== "granted") {
        setTestSentToast("Permissão negada no navegador. Permita as notificações.");
        setTimeout(() => setTestSentToast(null), 3000);
        return;
      }
    }

    let title = "";
    let body = "";

    if (type === "new_content") {
      title = "Novo Conteúdo no AVA IFES 📚";
      body = "O professor postou novo material e atividade na disciplina de Administração Geral.";
    } else if (type === "team_message") {
      title = "Nova Mensagem na Sala Virtual 💬";
      body = "Beatriz Oliveira: 'Revisando agora o tópico de funções para a prova!'";
    } else if (type === "deadline_approaching") {
      title = "Prazo Próximo do Fim ⏰";
      body = `Atenção: A Lista de Exercícios de Matemática vence em breve (${getLeadTimeLabel(
        prefs
      )}).`;
    }

    const success = await triggerStrictNotification(type, { title, body, url: "/" });
    if (success) {
      setTestSentToast(`Notificação de teste enviada (${type})!`);
    } else {
      setTestSentToast("Notificação gerada! Verifique a central do seu dispositivo.");
    }
    setTimeout(() => setTestSentToast(null), 3500);
  };

  // Cálculo didático de exemplo para a UI
  const leadMinutes = calculateLeadTimeMinutes(prefs);
  const sampleDeadlineTo = new Date();
  sampleDeadlineTo.setHours(23, 59, 0, 0);
  const sampleAlertTime = new Date(sampleDeadlineTo.getTime() - leadMinutes * 60 * 1000);

  return (
    <div
      id="notification-settings-modal"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[var(--app-card)] text-[var(--app-text)] rounded-3xl shadow-2xl w-full max-w-xl border border-[var(--app-border)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--app-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-[var(--app-text)] flex items-center gap-2">
                Sistema de Notificações
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Gatilhos estritos de disparo & antecedência personalizada de prazos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--app-bg)] hover:bg-[var(--app-border)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 pr-4">
          {/* Status de Permissão no Dispositivo */}
          <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--app-primary)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-text)]">
                  Permissão no Dispositivo
                </span>
              </div>
              <p className="text-xs text-[var(--app-text-muted)]">
                {permissionStatus === "granted" ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Notificações Nativas e PWA ativas
                  </span>
                ) : permissionStatus === "denied" ? (
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Bloqueadas no navegador
                  </span>
                ) : (
                  <span className="text-amber-500 font-bold">
                    Ainda não autorizadas pelo usuário
                  </span>
                )}
              </p>
            </div>

            {permissionStatus !== "granted" && (
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isRequestingPermission}
                className="px-4 py-2 bg-[var(--app-primary)] hover:opacity-90 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isRequestingPermission ? "Solicitando..." : "Autorizar Notificações"}</span>
              </button>
            )}
          </div>

          {/* Seção 1: Gatilhos Estritos de Disparo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  1. Gatilhos Estritos de Disparo
                </h3>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  O Brain Studio <strong>não emite notificações genéricas</strong> ou de incentivo aleatório.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Gatilho 1: Novo Conteúdo AVA IFES */}
              <label className="flex items-start justify-between p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/40 transition cursor-pointer">
                <div className="flex items-start gap-3 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--app-text)]">
                      Novo Conteúdo Postado (AVA IFES)
                    </div>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Alertar quando uma nova disciplina, aviso ou material for disponibilizado pelos professores no AVA.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableNewContent}
                  onChange={(e) => setPrefs({ ...prefs, enableNewContent: e.target.checked })}
                  className="w-4 h-4 mt-1 accent-[var(--app-primary)] cursor-pointer"
                />
              </label>

              {/* Gatilho 2: Mensagem na Equipe */}
              <label className="flex items-start justify-between p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/40 transition cursor-pointer">
                <div className="flex items-start gap-3 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--app-text)]">
                      Nova Mensagem na Equipe (Sala Virtual)
                    </div>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Alertar quando receber mensagem direta ou interação no chat da sua equipe de estudos.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableTeamMessages}
                  onChange={(e) => setPrefs({ ...prefs, enableTeamMessages: e.target.checked })}
                  className="w-4 h-4 mt-1 accent-[var(--app-primary)] cursor-pointer"
                />
              </label>

              {/* Gatilho 3: Prazos Próximos do Fim */}
              <label className="flex items-start justify-between p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/40 transition cursor-pointer">
                <div className="flex items-start gap-3 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--app-text)]">
                      Prazos Próximos do Fim
                    </div>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Alertar sobre tarefas, provas ou trabalhos cuja data limite esteja se aproximando.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableDeadlines}
                  onChange={(e) => setPrefs({ ...prefs, enableDeadlines: e.target.checked })}
                  className="w-4 h-4 mt-1 accent-[var(--app-primary)] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Seção 2: Configuração de Antecedência do Prazo (Lead Time Personalizado) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  2. Antecedência do Prazo (Lead Time Personalizado)
                </h3>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  Com quanto tempo de antecedência o Service Worker deve calcular e disparar o alerta.
                </p>
              </div>
            </div>

            {/* Grid com opções de intervalo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LEAD_TIME_PRESETS.map((preset) => {
                const isSelected = prefs.leadTimePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, leadTimePreset: preset.id })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[var(--app-primary)]/10 border-[var(--app-primary)] text-[var(--app-primary)] shadow-xs"
                        : "bg-[var(--app-bg)] border-[var(--app-border)] text-[var(--app-text)] hover:border-[var(--app-border-hover)]"
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--app-primary)]" />}
                  </button>
                );
              })}
            </div>

            {/* Se Personalizado selecionado: exibe campos numéricos */}
            {prefs.leadTimePreset === "custom" && (
              <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-primary)]/40 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider block">
                  Defina o Intervalo Personalizado:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={prefs.customLeadTimeValue}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        customLeadTimeValue: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-24 px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-xl text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                  />
                  <select
                    value={prefs.customLeadTimeUnit}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        customLeadTimeUnit: e.target.value as "hours" | "days",
                      })
                    }
                    className="px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-xl text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] cursor-pointer"
                  >
                    <option value="hours">Horas antes</option>
                    <option value="days">Dias antes</option>
                  </select>
                </div>
              </div>
            )}

            {/* Painel didático demonstrando o Agendamento Dinâmico */}
            <div className="p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-[var(--app-text-muted)] leading-relaxed">
                <strong className="text-[var(--app-text)] block mb-0.5">Agendamento Dinâmico em Segundo Plano:</strong>
                Para um prazo às <strong>23:59</strong>, o Service Worker calculará o horário exato do alerta para às{" "}
                <span className="font-mono text-[var(--app-primary)] font-bold">
                  {sampleAlertTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>{" "}
                (antecedência de {getLeadTimeLabel(prefs)}).
              </div>
            </div>
          </div>

          {/* Seção 3: Teste de Disparo dos 3 Gatilhos */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">
              Testar Notificações no Dispositivo:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTestTrigger("new_content")}
                className="px-3 py-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-border)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>Testar AVA IFES</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestTrigger("team_message")}
                className="px-3 py-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-border)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
                <span>Testar Equipe</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestTrigger("deadline_approaching")}
                className="px-3 py-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-border)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Testar Prazo</span>
              </button>
            </div>

            {testSentToast && (
              <p className="text-[11px] font-bold text-[var(--app-primary)] animate-in fade-in text-center pt-1">
                {testSentToast}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[var(--app-border)] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-[var(--app-bg)] hover:bg-[var(--app-border)] text-[var(--app-text)] rounded-xl text-xs font-bold transition cursor-pointer border border-[var(--app-border)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[var(--app-primary)] hover:opacity-90 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? "Salvando..." : "Salvar Preferências"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
