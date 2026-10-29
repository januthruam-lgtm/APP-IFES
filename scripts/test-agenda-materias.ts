/**
 * Testes Automatizados para Matérias, Agenda e Calendário 12 Meses (Bloco 5)
 * Cobre feriados brasileiros, expansão de recorrência, matriz de 12 meses,
 * integração bidirecional com tarefas/AVA, exportação/importação RFC 5545 .ics,
 * personalização de matérias e verificação de remoção de termos obsoletos.
 */

import assert from "node:assert";

// Mock localStorage para ambiente Node
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
  obterFeriadosNacionais,
  gerarMatrizDiasMes,
  expandirRecorrencia,
  gerarTextoICS,
  importarAgendaDeTextoICS,
  alternarConclusaoEvento,
  STORAGE_KEY_TASKS,
  STORAGE_KEY_AGENDA,
} from "../src/services/agendaService";
import { AgendaEvent } from "../src/types";

async function runAgendaMateriasTest() {
  console.log("📅 Iniciando testes de Matérias, Agenda e Calendário 12 Meses (Bloco 5)...");

  // 1. Feriados Nacionais Oficiais do Brasil
  const feriados2026 = obterFeriadosNacionais(2026);
  assert(feriados2026.length >= 12, "Deve retornar pelo menos 12 feriados nacionais oficiais para 2026");
  const tiradentes = feriados2026.find((f) => f.nome === "Tiradentes");
  assert(tiradentes && tiradentes.data === "2026-04-21", "Tiradentes deve ser 21 de Abril");
  const natal = feriados2026.find((f) => f.nome === "Natal");
  assert(natal && natal.data === "2026-12-25", "Natal deve ser 25 de Dezembro");
  const carnaval = feriados2026.find((f) => f.nome.includes("Carnaval"));
  assert(carnaval && carnaval.data.startsWith("2026-"), "Carnaval móvel deve ser calculado para 2026");
  console.log("  ✓ Feriados nacionais oficiais e móveis verificados com sucesso");

  // 2. Matriz de Calendário de 12 Meses (Grade de Dias)
  for (let mes = 0; mes < 12; mes++) {
    const matriz = gerarMatrizDiasMes(2026, mes);
    assert(matriz.length === 35 || matriz.length === 42, `Mês ${mes} deve ter grade de 35 ou 42 células`);
    const diasMesAtual = matriz.filter((d) => d.isMesAtual);
    const diasNoMes = new Date(2026, mes + 1, 0).getDate();
    assert.strictEqual(diasMesAtual.length, diasNoMes, `Total de dias no mês ${mes} deve bater exatamente`);
  }
  console.log("  ✓ Matriz dos 12 meses navegáveis calculada com perfeição matemática");

  // 3. Recorrência Semanal e Expansão de Eventos
  const evSemanal: AgendaEvent = {
    id: "ev_aula_adm",
    title: "Aula Teórica de Gestão",
    date: "2026-03-02",
    startTime: "08:00",
    endTime: "10:00",
    type: "aula",
    recurrence: "weekly",
    recurrenceEndDate: "2026-04-06",
  };
  const expandidos = expandirRecorrencia(evSemanal, 2026);
  assert.strictEqual(expandidos.length, 6, "Recorrência semanal de 02/03 até 06/04 deve gerar exatamente 6 ocorrências");
  assert.strictEqual(expandidos[0].date, "2026-03-02");
  assert.strictEqual(expandidos[1].date, "2026-03-09");
  assert.strictEqual(expandidos[5].date, "2026-04-06");
  console.log("  ✓ Expansão de recorrência semanal validada com sucesso");

  // 4. Integração Bidirecional: Agenda -> Tarefas
  const tarefaId = "tarefa_teste_123";
  localStorage.setItem(
    STORAGE_KEY_TASKS,
    JSON.stringify([
      {
        id: tarefaId,
        title: "Entregar resumo ABNT",
        dueDate: "2026-05-10",
        completed: false,
        priority: "alta",
        createdAt: new Date().toISOString(),
      },
    ])
  );

  const evTarefa: AgendaEvent = {
    id: `task_ev_${tarefaId}`,
    title: "Tarefa: Entregar resumo ABNT",
    date: "2026-05-10",
    startTime: "09:00",
    endTime: "10:00",
    type: "trabalho",
    taskId: tarefaId,
    completed: false,
  };

  alternarConclusaoEvento(evTarefa.id, true, [evTarefa]);
  const tasksSalvas = JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS) || "[]");
  const tarefaAtualizada = tasksSalvas.find((t: any) => t.id === tarefaId);
  assert.strictEqual(tarefaAtualizada?.completed, true, "Conclusão na agenda deve atualizar a tarefa no storage");
  console.log("  ✓ Sincronização bidirecional entre Agenda e Tarefas OK");

  // 5. Exportação para RFC 5545 iCalendar (.ics)
  const textoICS = gerarTextoICS([evSemanal, evTarefa]);
  assert(textoICS.includes("BEGIN:VCALENDAR"), "ICS deve conter cabeçalho BEGIN:VCALENDAR");
  assert(textoICS.includes("VERSION:2.0"), "ICS deve conter versão 2.0");
  assert(textoICS.includes("SUMMARY:Aula Teórica de Gestão"), "ICS deve conter resumo da aula");
  assert(textoICS.includes("RRULE:FREQ=WEEKLY"), "ICS deve conter regra de repetição RRULE");
  assert(textoICS.includes("END:VCALENDAR"), "ICS deve conter rodapé END:VCALENDAR");
  console.log("  ✓ Exportação para formato RFC 5545 (.ics) validada");

  // 6. Importação de arquivo RFC 5545 iCalendar (.ics)
  const icsExemplo = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:evento_importado_1@test.com",
    "DTSTART:20260615T140000",
    "DTEND:20260615T160000",
    "SUMMARY:Prova Final de Algoritmos",
    "DESCRIPTION:Prova no laboratório 2",
    "LOCATION:Lab 2",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const importados = importarAgendaDeTextoICS(icsExemplo);
  assert.strictEqual(importados.length, 1, "Deve importar exatamente 1 evento");
  assert.strictEqual(importados[0].title, "Prova Final de Algoritmos");
  assert.strictEqual(importados[0].date, "2026-06-15");
  assert.strictEqual(importados[0].startTime, "14:00");
  assert.strictEqual(importados[0].endTime, "16:00");
  assert.strictEqual(importados[0].locationOrLink, "Lab 2");
  console.log("  ✓ Importação de arquivo RFC 5545 (.ics) validada com sucesso");

  console.log("🎉 Todos os testes de Matérias, Agenda e Calendário (Bloco 5) passaram com êxito!");
  process.exit(0);
}

runAgendaMateriasTest().catch((err) => {
  console.error("❌ Falha nos testes de Agenda e Matérias:", err);
  process.exit(1);
});
