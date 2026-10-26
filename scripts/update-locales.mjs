import fs from "fs";

function updateJson(filePath, updater) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  updater(data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

updateJson("./src/locales/pt-PT.json", (data) => {
  if (!data.nav) data.nav = {};
  data.nav.cidade = "Cidade do Saber";
  data.nav.configuracoes = "Definições";

  data.auth = {
    titulo: "Brain Studio • Acesso Institucional",
    subtitulo: "Identificação institucional e ambiente de estudos",
    sucesso_login: "Ligado com sucesso!",
    erro_preenchimento: "Preencha o seu nome e endereço de correio eletrónico.",
    placeholder_nome: "O seu nome completo",
    placeholder_matricula: "O seu número de estudante",
    placeholder_email: "O seu correio eletrónico",
    placeholder_senha: "A sua palavra-passe",
    erro_matricula: "Introduza o seu número de estudante ou utilizador.",
    erro_senha: "Introduza a sua palavra-passe.",
    erro_credenciais: "Utilizador ou palavra-passe incorretos.",
    erro_conexao: "Erro na ligação institucional."
  };

  data.ajustes = {
    aparencia: "Aspeto da Aplicação",
    aparencia_desc: "Alterne entre os temas Claro e Escuro",
    tema_claro: "Tema Claro",
    tema_escuro: "Tema Escuro",
    seguir_sistema: "Seguir automaticamente o tema do sistema operativo"
  };
});

updateJson("./src/locales/en-GB.json", (data) => {
  if (!data.nav) data.nav = {};
  data.nav.cidade = "Knowledge City";
  data.nav.configuracoes = "Settings";

  data.auth = {
    titulo: "Brain Studio • Academic Access",
    subtitulo: "Institutional identification and learning environment",
    sucesso_login: "Successfully connected!",
    erro_preenchimento: "Please enter your name and email.",
    placeholder_nome: "Your full name",
    placeholder_matricula: "Your student ID or username",
    placeholder_email: "Your email address",
    placeholder_senha: "Your password",
    erro_matricula: "Please enter your student ID or username.",
    erro_senha: "Please enter your password.",
    erro_credenciais: "Incorrect username or password.",
    erro_conexao: "Connection error with institution."
  };

  data.ajustes = {
    aparencia: "App Appearance",
    aparencia_desc: "Switch between official Light and Dark themes",
    tema_claro: "Light Theme",
    tema_escuro: "Dark Theme",
    seguir_sistema: "Automatically match operating system theme"
  };
});

updateJson("./src/locales/es.json", (data) => {
  if (!data.nav) data.nav = {};
  data.nav.cidade = "Ciudad del Saber";
  data.nav.configuracoes = "Configuración";

  data.auth = {
    titulo: "Brain Studio • Acceso Institucional",
    subtitulo: "Identificación institucional y entorno de estudio",
    sucesso_login: "¡Conectado con éxito!",
    erro_preenchimento: "Complete su nombre y correo electrónico.",
    placeholder_nome: "Su nombre completo",
    placeholder_matricula: "Su matrícula o usuario",
    placeholder_email: "Su correo institucional",
    placeholder_senha: "Su contraseña de acceso",
    erro_matricula: "Ingrese su matrícula o usuario.",
    erro_senha: "Ingrese su contraseña de acceso.",
    erro_credenciais: "Nombre de usuario o contraseña incorrectos.",
    erro_conexao: "Error en la conexión institucional."
  };

  data.ajustes = {
    aparencia: "Apariencia de la Aplicación",
    aparencia_desc: "Alterne entre los temas Claro y Oscuro",
    tema_claro: "Tema Claro",
    tema_escuro: "Tema Oscuro",
    seguir_sistema: "Seguir automáticamente el tema del sistema operativo"
  };
});

updateJson("./src/locales/fr.json", (data) => {
  if (!data.nav) data.nav = {};
  data.nav.cidade = "Cité du Savoir";
  data.nav.configuracoes = "Paramètres";

  data.auth = {
    titulo: "Brain Studio • Accès Institutionnel",
    subtitulo: "Identification institutionnelle et environnement d'études",
    sucesso_login: "Connecté avec succès !",
    erro_preenchimento: "Veuillez renseigner votre nom et votre adresse e-mail.",
    placeholder_nome: "Votre nom complet",
    placeholder_matricula: "Votre identifiant ou matricule",
    placeholder_email: "Votre adresse e-mail",
    placeholder_senha: "Votre mot de passe",
    erro_matricula: "Veuillez indiquer votre matricule ou identifiant.",
    erro_senha: "Veuillez indiquer votre mot de passe.",
    erro_credenciais: "Identifiant ou mot de passe incorrect.",
    erro_conexao: "Erreur de connexion institutionnelle."
  };

  data.ajustes = {
    aparencia: "Apparence de l'application",
    aparencia_desc: "Basculez entre les thèmes Clair et Sombre",
    tema_claro: "Thème Clair",
    tema_escuro: "Thème Sombre",
    seguir_sistema: "Suivre automatiquement le thème du système"
  };
});

console.log("Updated pt-PT, en-GB, es, fr successfully.");
