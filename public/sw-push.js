/**
 * Brain Studio - Service Worker Push & Strict Notification Engine
 * 
 * Regras Estritas de Disparo (Exclusivas):
 * 1. new_content: Novo Conteúdo Postado no AVA IFES
 * 2. team_message: Nova Mensagem na Equipe / Sala Virtual
 * 3. deadline_approaching: Prazos Próximos do Fim (com Lead Time personalizado)
 * 
 * Qualquer notificação fora desses 3 gatilhos é estritamente ignorada e bloqueada.
 */

const STRICT_GATILHOS = ['new_content', 'team_message', 'deadline_approaching'];

// Tabela em memória de prazos agendados no Service Worker
let scheduledDeadlines = [];
let deadlineIntervalId = null;

// Avalia os prazos pendentes e emite notificação quando alertTimestamp for atingido
function evaluatePendingDeadlines() {
  const now = Date.now();
  const remaining = [];

  for (const item of scheduledDeadlines) {
    if (item.alertTimestamp <= now) {
      if (!item.notified) {
        item.notified = true;
        
        // Disparo estrito de Prazo Próximo do Fim
        const remainingMinutes = Math.max(0, Math.round((item.dueTimestamp - now) / (60 * 1000)));
        let leadLabel = `${remainingMinutes} minutos`;
        if (remainingMinutes >= 60) {
          const hours = Math.round(remainingMinutes / 60);
          leadLabel = hours === 1 ? '1 hora' : `${hours} horas`;
        }

        self.registration.showNotification(item.title || 'Prazo Próximo do Fim ⚠️', {
          body: item.body || `Falta pouco tempo (${leadLabel}) para a entrega de: ${item.taskName || 'Atividade Acadêmica'}.`,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `deadline-${item.id}`,
          requireInteraction: true,
          data: {
            url: item.url || '/?tab=tasks',
            type: 'deadline_approaching',
            taskId: item.id,
          },
          vibrate: [200, 100, 200],
          actions: [
            { action: 'view_task', title: 'Ver Tarefa' },
            { action: 'dismiss', title: 'Entendido' },
          ],
        });
      }
    } else {
      remaining.push(item);
    }
  }

  scheduledDeadlines = remaining;
}

// Inicia varredura periódica de prazos
if (!deadlineIntervalId) {
  deadlineIntervalId = setInterval(evaluatePendingDeadlines, 20000);
}

// 1. Escuta por Web Push disparado pelo servidor
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data = {
        title: 'Brain Studio',
        body: event.data.text(),
        type: 'deadline_approaching',
      };
    }
  }

  const triggerType = data.type || 'deadline_approaching';

  // REGRA ESTRITA: Bloqueia qualquer notificação genérica ou aleatória
  if (!STRICT_GATILHOS.includes(triggerType)) {
    console.warn('[SW-Push] Notificação descartada - Gatilho não permitido:', triggerType);
    return;
  }

  let defaultTitle = 'Brain Studio';
  let defaultUrl = '/';

  if (triggerType === 'new_content') {
    defaultTitle = 'Novo Conteúdo no AVA IFES 📚';
    defaultUrl = '/?tab=ifes';
  } else if (triggerType === 'team_message') {
    defaultTitle = 'Nova Mensagem na Equipe 💬';
    defaultUrl = '/?tab=study-room';
  } else if (triggerType === 'deadline_approaching') {
    defaultTitle = 'Prazo Próximo do Fim ⏰';
    defaultUrl = '/?tab=tasks';
  }

  const title = data.title || defaultTitle;
  const options = {
    body: data.body || 'Atualização disponível no Brain Studio.',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    tag: data.tag || `bs-${triggerType}-${Date.now()}`,
    data: {
      url: data.url || defaultUrl,
      type: triggerType,
      payload: data,
    },
    vibrate: [150, 100, 150],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Escuta cliques em notificações para navegação inteligente
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  let targetUrl = notifData.url || '/';

  if (event.action === 'view_task' || notifData.type === 'deadline_approaching') {
    targetUrl = '/?tab=tasks';
  } else if (notifData.type === 'team_message') {
    targetUrl = '/?tab=study-room';
  } else if (notifData.type === 'new_content') {
    targetUrl = '/?tab=ifes';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se houver uma aba aberta, foca nela e envia mensagem para trocar de aba
      for (const client of windowClients) {
        if ('focus' in client) {
          client.postMessage({
            type: 'BRAIN_STUDIO_NAVIGATE_TAB',
            notificationType: notifData.type,
            targetUrl: targetUrl,
          });
          return client.focus();
        }
      }
      // Caso contrário, abre uma nova janela no endereço alvo
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 3. Comunicação via postMessage com o cliente do aplicativo
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Agendamento Dinâmico de Prazos (Lead Time recalculado)
  if (event.data.type === 'SCHEDULE_DYNAMIC_DEADLINES') {
    const { deadlines } = event.data;
    if (Array.isArray(deadlines)) {
      scheduledDeadlines = deadlines.map((d) => ({
        id: d.id,
        taskName: d.taskName,
        title: d.title || 'Prazo Próximo do Fim ⏰',
        body: d.body,
        alertTimestamp: d.alertTimestamp,
        dueTimestamp: d.dueTimestamp,
        url: d.url || '/?tab=tasks',
        notified: false,
      }));

      // Executa verificação imediata para prazos que já entraram na janela de antecedência
      evaluatePendingDeadlines();
    }
  }

  // Disparo Direto de Notificação Estrita a partir da UI
  if (event.data.type === 'DISPATCH_STRICT_NOTIFICATION') {
    const { notifType, title, body, url, tag } = event.data;
    
    // REGRA ESTRITA: Bloqueia qualquer outro gatilho não autorizado
    if (STRICT_GATILHOS.includes(notifType)) {
      self.registration.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: tag || `bs-${notifType}-${Date.now()}`,
        data: {
          url: url || '/',
          type: notifType,
        },
        vibrate: [150, 80, 150],
      });
    } else {
      console.warn('[SW-Push] Ignorado comando de disparo para tipo inválido:', notifType);
    }
  }
});
