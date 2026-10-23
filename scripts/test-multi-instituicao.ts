/**
 * Brain Studio - Testes Automatizados de Regras Multi-Instituição e Conexões (Fase 7)
 * Validação rigorosa de cálculos de notas, níveis, normalização, SSRF e segurança de credenciais.
 */

import {
  formatarNota,
  estaAprovado,
  normalizarParaPercentual,
  getSistemaNotaPadraoPorPais,
} from "../src/config/notas.config";
import { getNiveisPorPais, PERIODOS_ACADEMICOS } from "../src/config/niveis.config";
import { normalizarTexto, getNomePais } from "../src/features/instituicao/services/searchInstituicoes";
import { validarUrlSegura } from "../src/config/conectores.config";
import { validarSegurancaPayloadFirestore } from "../src/features/instituicao/storage/secureTokenStorage";
import {
  precisaConfirmarInstituicao,
  confirmarMigracaoIfesEmUmToque,
} from "../src/features/instituicao/services/migracaoIfes";

let totalTests = 0;
let passedTests = 0;

function assert(cond: boolean, desc: string) {
  totalTests++;
  if (cond) {
    passedTests++;
    console.log(`  ✓ ${desc}`);
  } else {
    console.error(`  ✗ FALHA: ${desc}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("TESTES MULTI-INSTITUIÇÃO E CONEXÕES SEGURAS (FASE 7)");
console.log("=======================================================\n");

// 1. Sistema de Notas e Fórmulas Puras
console.log("[1] Sistema de Notas e Fórmulas Puras:");
assert(formatarNota(8.5, "0_a_10") === "8,5", "Formatação escala 0 a 10");
assert(formatarNota(75, "0_a_100") === "75 pts", "Formatação escala 0 a 100 com sufixo");
assert(formatarNota(14, "0_a_20") === "14,0 val", "Formatação escala 0 a 20 com sufixo");
assert(formatarNota("A", "a_a_f") === "A", "Formatação letras A-F");
assert(formatarNota(null, "0_a_10") === "—", "Tratamento de nota nula");

assert(estaAprovado(6.0, "0_a_10") === true, "Aprovação em 6.0 na escala 0-10");
assert(estaAprovado(5.9, "0_a_10") === false, "Reprovação em 5.9 na escala 0-10");
assert(estaAprovado(60, "0_a_100") === true, "Aprovação em 60 na escala 0-100 (IFES)");
assert(estaAprovado(59, "0_a_100") === false, "Reprovação em 59 na escala 0-100 (IFES)");
assert(estaAprovado("B+", "a_a_f") === true, "Aprovação letra B+");
assert(estaAprovado("F", "a_a_f") === false, "Reprovação letra F");

assert(normalizarParaPercentual(5, "0_a_10") === 50, "Conversão 5/10 -> 50%");
assert(normalizarParaPercentual(100, "0_a_100") === 100, "Conversão 100/100 -> 100%");
assert(getSistemaNotaPadraoPorPais("BR") === "0_a_10", "Padrão de notas no Brasil");
assert(getSistemaNotaPadraoPorPais("PT") === "0_a_20", "Padrão de notas em Portugal");
assert(getSistemaNotaPadraoPorPais("US") === "a_a_f", "Padrão de notas nos EUA");

// 2. Níveis de Ensino e Períodos
console.log("\n[2] Níveis de Ensino e Períodos:");
const niveisBR = getNiveisPorPais("BR");
assert(niveisBR.some((n) => n.id === "br_tecnico_integrado"), "Contém Técnico Integrado no Brasil");
assert(niveisBR.some((n) => n.id === "br_graduacao"), "Contém Graduação no Brasil");

const niveisPT = getNiveisPorPais("PT");
assert(niveisPT.some((n) => n.id === "pt_licenciatura"), "Contém Licenciatura em Portugal");

const niveisUS = getNiveisPorPais("US");
assert(niveisUS.some((n) => n.id === "int_bachelor"), "Contém Bachelor nos EUA/Internacional");

assert(PERIODOS_ACADEMICOS.bimestre.divisoesPorAno === 4, "Bimestre tem 4 divisões por ano");
assert(PERIODOS_ACADEMICOS.semestre.divisoesPorAno === 2, "Semestre tem 2 divisões por ano");

// 3. Normalização e Intl.DisplayNames
console.log("\n[3] Normalização Unicode e Nomes de Países:");
assert(normalizarTexto("Instituto Federal do Espírito Santo") === "instituto federal do espirito santo", "Remoção de acentos em português");
assert(normalizarTexto("UNIVERSIDADE DE COIMBRA") === "universidade de coimbra", "Normalização lowercase");
assert(normalizarTexto("   ÁÉÍÓÚçãõ   ") === "aeioucao", "Remoção de caracteres especiais e espaços");

const nomeBr = getNomePais("BR", "pt-BR");
assert(nomeBr === "Brasil", `Intl.DisplayNames BR: ${nomeBr}`);
const nomePt = getNomePais("PT", "pt-BR");
assert(nomePt === "Portugal", `Intl.DisplayNames PT: ${nomePt}`);
const nomeUs = getNomePais("US", "pt-BR");
assert(nomeUs.toLowerCase().includes("estados unidos"), `Intl.DisplayNames US: ${nomeUs}`);

// 4. Segurança de URLs e Prevenção de SSRF
console.log("\n[4] Segurança de Conectores e Prevenção de SSRF:");
assert(validarUrlSegura("https://ava.ifes.edu.br").valida === true, "HTTPS legítimo permitido");
assert(validarUrlSegura("https://canvas.instructure.com/courses").valida === true, "HTTPS Canvas permitido");

assert(validarUrlSegura("http://inseguro.edu.br").valida === false, "Bloqueia HTTP não seguro");
assert(validarUrlSegura("javascript:alert(1)").valida === false, "Bloqueia scheme javascript:");
assert(validarUrlSegura("data:text/html,<script>").valida === false, "Bloqueia scheme data:");
assert(validarUrlSegura("https://localhost:8080").valida === false, "Bloqueia localhost");
assert(validarUrlSegura("https://127.0.0.1/admin").valida === false, "Bloqueia loopback IPv4");
assert(validarUrlSegura("https://169.254.169.254/latest/meta-data").valida === false, "Bloqueia AWS/GCP metadata IP");
assert(validarUrlSegura("https://metadata.google.internal").valida === false, "Bloqueia host GCP metadata");
assert(validarUrlSegura("https://192.168.1.1").valida === false, "Bloqueia rede local RFC1918 (192.168.x.x)");
assert(validarUrlSegura("https://10.0.0.5").valida === false, "Bloqueia rede local RFC1918 (10.x.x.x)");

// 5. Barreira de Segurança de Tokens no Firestore
console.log("\n[5] Barreira de Proteção contra Tokens no Firestore:");
let erroCapturado = false;
try {
  validarSegurancaPayloadFirestore({
    nome: "Moodle Teste",
    url: "https://moodle.escola.edu.br",
    token: "secreto12345",
  });
} catch (e: any) {
  erroCapturado = true;
  assert(e.message.includes("VIOLAÇÃO DE SEGURANÇA"), "Detectou e bloqueou campo token");
}
assert(erroCapturado, "Rejeitou envio com campo sensível");

let erroSenhaCapturado = false;
try {
  validarSegurancaPayloadFirestore({
    nome: "Portal Aluno",
    auth: { senha: "123" },
  });
} catch (e: any) {
  erroSenhaCapturado = true;
  assert(e.message.includes("VIOLAÇÃO DE SEGURANÇA"), "Detectou e bloqueou campo senha aninhado");
}
assert(erroSenhaCapturado, "Rejeitou envio com campo senha");

assert(
  validarSegurancaPayloadFirestore({
    id: "sys_123",
    conectorId: "moodle",
    nome: "Meu Moodle",
    status: "conectado",
  }) === true,
  "Payload seguro sem tokens é aprovado"
);

// 6. Migração Suave e Idempotente de Alunos IFES
console.log("\n[6] Migração Não Destrutiva de Alunos do IFES:");
const usuarioLegadoIfes = {
  name: "Aluno IFES",
  email: "20241001@ifes.edu.br",
  campus: "Cefor",
  matricula: "20241001",
};
assert(precisaConfirmarInstituicao(usuarioLegadoIfes) === true, "Detecta necessidade de confirmação para aluno legado");

const perfilConfirmado = confirmarMigracaoIfesEmUmToque("Campus Cefor", "Administração");
assert(perfilConfirmado.instituicaoId === "br-ifes-cefor", "ID estável do IFES Cefor atribuído");
assert(perfilConfirmado.confirmada === true, "Perfil marcado como confirmado");
assert(perfilConfirmado.sistemaNotaId === "0_a_100", "Sistema 0-100 do IFES preservado");

console.log("\n=======================================================");
console.log(`TOTAL DE TESTES: ${totalTests} | APROVADOS: ${passedTests}`);
console.log("=======================================================\n");

if (totalTests !== passedTests) {
  process.exit(1);
}
