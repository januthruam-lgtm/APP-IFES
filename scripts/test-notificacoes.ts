/**
 * Teste Automatizado da Central de Notificações Unificadas (Bloco 4)
 * Testa preferências, silenciar tudo, filtragem por categoria,
 * criação de notificações, contagem de não-lidas, marcar como lida e limpeza.
 */

import assert from "node:assert";

// Mock localStorage for Node environment if running outside browser
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    length: 0,
  } as any;
}

if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  (globalThis as any).CustomEvent = class CustomEvent {
    type: string;
    detail: any;
    constructor(type: string, params?: { detail: any }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

import {
  CONFIG_NOTIFICACOES_PADRAO,
  obterConfiguracoesNotificacao,
  salvarConfiguracoesNotificacao,
  carregarNotificacoesLocais,
  criarNotificacao,
  marcarNotificacaoComoLida,
  marcarTodasComoLidas,
  limparNotificacoesLidas,
} from "../src/services/notificationService";

async function runNotificationsTest() {
  console.log("🔔 Iniciando testes automatizados da Central de Notificações (Bloco 4)...");

  const uid = `test_user_${Date.now()}`;

  // 1. Configurações padrão
  const prefsIniciais = obterConfiguracoesNotificacao(uid);
  assert.strictEqual(prefsIniciais.silenciarTudo, false, "Silenciar tudo deve ser falso por padrão");
  assert.strictEqual(prefsIniciais.prazo24h, true, "Prazo 24h deve ser true por padrão");
  assert.strictEqual(prefsIniciais.lembreteOfensiva, true, "Lembrete de ofensiva deve ser true por padrão");
  console.log("  ✓ Configurações padrão verificadas com sucesso");

  // 2. Modificação de preferências
  await salvarConfiguracoesNotificacao(uid, {
    ...prefsIniciais,
    conquistas: false,
    horarioOfensiva: "21:30",
  });
  const prefsAtualizadas = obterConfiguracoesNotificacao(uid);
  assert.strictEqual(prefsAtualizadas.conquistas, false, "Preferência conquistas deve ser salva como false");
  assert.strictEqual(prefsAtualizadas.horarioOfensiva, "21:30", "Horário ofensiva deve ser 21:30");
  console.log("  ✓ Atualização de preferências persistida com sucesso");

  // 3. Bloqueio de tipo desativado
  const itemConquista = await criarNotificacao(uid, {
    userId: uid,
    tipo: "conquista",
    titulo: "Nova Conquista!",
    mensagem: "Você desbloqueou um novo troféu",
  });
  assert.strictEqual(itemConquista, null, "Notificação de conquista deve ser descartada quando desativada");

  // 4. Criação de tipo permitido
  const itemPrazo = await criarNotificacao(uid, {
    userId: uid,
    tipo: "prazo",
    titulo: "Trabalho de Física amanhã",
    mensagem: "Entrega às 23:59 no AVA",
    linkTab: "estudar",
    linkSubView: "agenda",
  });
  assert(itemPrazo !== null, "Notificação de prazo deve ser criada com sucesso");
  assert.strictEqual(itemPrazo.lida, false, "Notificação criada deve iniciar como não lida");
  assert.strictEqual(itemPrazo.linkTab, "estudar");

  const itemPet = await criarNotificacao(uid, {
    userId: uid,
    tipo: "pet",
    titulo: "Pet subiu de nível!",
    mensagem: "Lúmen agora está no nível 2",
    linkTab: "jogo",
  });
  assert(itemPet !== null, "Notificação de pet deve ser criada");

  // 5. Verificação da lista local e contagem de não lidas
  let lista = carregarNotificacoesLocais(uid);
  assert.strictEqual(lista.length, 2, "Devem haver exatamente 2 notificações ativas");
  let naoLidas = lista.filter((n) => !n.lida).length;
  assert.strictEqual(naoLidas, 2, "Contagem de não lidas deve ser 2");
  console.log("  ✓ Criação e contagem inicial de notificações não lidas OK");

  // 6. Marcar uma notificação individual como lida
  await marcarNotificacaoComoLida(uid, itemPrazo.id);
  lista = carregarNotificacoesLocais(uid);
  const prazoAtualizado = lista.find((n) => n.id === itemPrazo.id);
  assert.strictEqual(prazoAtualizado?.lida, true, "Item de prazo deve estar marcado como lido");
  naoLidas = lista.filter((n) => !n.lida).length;
  assert.strictEqual(naoLidas, 1, "Contagem de não lidas deve cair para 1");
  console.log("  ✓ Marcar notificação individual como lida OK");

  // 7. Marcar todas como lidas
  await marcarTodasComoLidas(uid);
  lista = carregarNotificacoesLocais(uid);
  naoLidas = lista.filter((n) => !n.lida).length;
  assert.strictEqual(naoLidas, 0, "Todas as notificações devem estar lidas");
  console.log("  ✓ Marcar todas notificações como lidas OK");

  // 8. Limpar notificações lidas
  await limparNotificacoesLidas(uid);
  lista = carregarNotificacoesLocais(uid);
  assert.strictEqual(lista.length, 0, "Lista de notificações deve estar vazia após limpeza de lidas");
  console.log("  ✓ Limpeza de notificações lidas OK");

  // 9. Modo 'Não Perturbe' (silenciarTudo) bloqueia qualquer criação
  await salvarConfiguracoesNotificacao(uid, {
    ...prefsAtualizadas,
    silenciarTudo: true,
  });
  const itemBloqueado = await criarNotificacao(uid, {
    userId: uid,
    tipo: "prazo",
    titulo: "Urgente",
    mensagem: "Prazo eminente",
  });
  assert.strictEqual(itemBloqueado, null, "Silenciar tudo deve bloquear criação de qualquer notificação");
  console.log("  ✓ Modo 'Não Perturbe' verificado com sucesso");

  console.log("🎉 Todos os testes de notificações (Bloco 4) passaram com sucesso!");
  process.exit(0);
}

runNotificationsTest().catch((err) => {
  console.error("❌ Falha nos testes de notificações:", err);
  process.exit(1);
});
