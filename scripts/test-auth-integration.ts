import {
  getAuthErrorMessage,
  cadastrarComEmailESenha,
  entrarComEmailESenha,
  entrarComGoogle,
  enviarConfirmacaoPorEmail,
  enviarEmailRecuperacaoSenha,
  desconectarUsuario,
  monitorarEstadoAutenticacao,
  obterUsuarioAtual,
} from "../src/services/authService";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    process.exit(1);
  }
  console.log(`✅ SUCESSO: ${message}`);
}

console.log("=== INICIANDO BATERIA DE TESTES: AUTENTICAÇÃO FIREBASE ===");

// 1. Mensagens de erro amigáveis para o usuário
console.log("\n--- 1. Mensagens de Erro Traduzidas do Firebase Auth ---");
assert(
  getAuthErrorMessage("auth/email-already-in-use").includes("já está cadastrado"),
  "auth/email-already-in-use mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/invalid-email").includes("inválido"),
  "auth/invalid-email mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/weak-password").includes("6 caracteres"),
  "auth/weak-password mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/wrong-password").includes("Senha incorreta"),
  "auth/wrong-password mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/user-not-found").includes("Nenhuma conta cadastrada"),
  "auth/user-not-found mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/invalid-credential").includes("incorretos"),
  "auth/invalid-credential mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/network-request-failed").includes("internet"),
  "auth/network-request-failed mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/popup-blocked").includes("pop-up foi bloqueada"),
  "auth/popup-blocked mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/popup-closed-by-user").includes("fechada"),
  "auth/popup-closed-by-user mapeado corretamente"
);
assert(
  getAuthErrorMessage("auth/unauthorized-domain").includes("Domínio"),
  "auth/unauthorized-domain mapeado corretamente"
);
assert(
  getAuthErrorMessage("codigo_desconhecido").includes("Ocorreu um erro"),
  "Código desconhecido retorna fallback seguro"
);

// 2. Verificação de exportação e assinaturas de funções
console.log("\n--- 2. Assinaturas e Funções Exportadas ---");
assert(typeof cadastrarComEmailESenha === "function", "cadastrarComEmailESenha é uma função");
assert(typeof entrarComEmailESenha === "function", "entrarComEmailESenha é uma função");
assert(typeof entrarComGoogle === "function", "entrarComGoogle é uma função");
assert(typeof enviarConfirmacaoPorEmail === "function", "enviarConfirmacaoPorEmail é uma função");
assert(typeof enviarEmailRecuperacaoSenha === "function", "enviarEmailRecuperacaoSenha é uma função");
assert(typeof desconectarUsuario === "function", "desconectarUsuario é uma função");
assert(typeof monitorarEstadoAutenticacao === "function", "monitorarEstadoAutenticacao é uma função");
assert(typeof obterUsuarioAtual === "function", "obterUsuarioAtual é uma função");

console.log("\n🎉 TODOS OS TESTES DE AUTENTICAÇÃO PASSARAM COM SUCESSO!");
