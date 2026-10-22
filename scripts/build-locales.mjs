import fs from "fs";
import path from "path";

const ptBR = JSON.parse(fs.readFileSync("./src/locales/pt-BR.json", "utf-8"));
const en = JSON.parse(fs.readFileSync("./src/locales/en.json", "utf-8"));
const es = JSON.parse(fs.readFileSync("./src/locales/es.json", "utf-8"));

// 1. Dicionário de variantes de Portugal (pt-PT)
const ptPtOverrides = {
  salvar: "Guardar",
  Salvar: "Guardar",
  usuário: "utilizador",
  Usuário: "Utilizador",
  usuários: "utilizadores",
  equipe: "equipa",
  Equipe: "Equipa",
  equipes: "equipas",
  arquivo: "ficheiro",
  Arquivo: "Ficheiro",
  arquivos: "ficheiros",
  tela: "ecrã",
  Tela: "Ecrã",
  telas: "ecrãs",
  celular: "telemóvel",
  registro: "registo",
  cadastre: "registe",
  cadastro: "registo",
  planejamento: "planeamento",
  conosco: "connosco",
};

function deepTransform(obj, replacer) {
  if (typeof obj === "string") {
    let res = obj;
    for (const [k, v] of Object.entries(replacer)) {
      const reg = new RegExp(`\\b${k}\\b`, "g");
      res = res.replace(reg, v);
    }
    return res;
  }
  if (Array.isArray(obj)) {
    return obj.map((i) => deepTransform(i, replacer));
  }
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = deepTransform(v, replacer);
    }
    return out;
  }
  return obj;
}

const ptPT = deepTransform(ptBR, ptPtOverrides);
// Ajustes manuais finos para pt-PT
if (ptPT.comum) {
  ptPT.comum.salvar = "Guardar";
}
fs.writeFileSync("./src/locales/pt-PT.json", JSON.stringify(ptPT, null, 2), "utf-8");
console.log("✅ pt-PT.json criado com sucesso");

// 2. Dicionário de variantes Britânicas (en-GB)
const enGbOverrides = {
  color: "colour",
  Color: "Colour",
  colors: "colours",
  Colors: "Colours",
  customize: "customise",
  Customize: "Customise",
  customized: "customised",
  customization: "customisation",
  favorite: "favourite",
  Favorite: "Favourite",
  favorites: "favourites",
  behavior: "behaviour",
  Behavior: "Behaviour",
  license: "licence",
  License: "Licence",
  organization: "organisation",
  Organization: "Organisation",
  center: "centre",
  Center: "Centre",
};

const enGB = deepTransform(en, enGbOverrides);
fs.writeFileSync("./src/locales/en-GB.json", JSON.stringify(enGB, null, 2), "utf-8");
console.log("✅ en-GB.json criado com sucesso");

// 3. Francês (fr.json) - Baseado em estrutura estrita idêntica a en.json e pt-BR.json
const frBase = {
  comum: {
    salvar: "Enregistrer",
    cancelar: "Annuler",
    fechar: "Fermer",
    voltar: "Retour",
    continuar: "Continuer",
    concluir: "Terminer",
    pular: "Passer",
    carregando: "Chargement...",
    sucesso: "Succès",
    erro: "Erreur",
    confirmar: "Confirmer",
    pesquisar: "Rechercher",
    limpar: "Effacer",
    dias_um: "{{count}} jour",
    dias_outros: "{{count}} jours",
    pontos: "{{count}} pts",
    moedas: "{{count}} pièces",
    nivel: "Niveau {{level}}"
  },
  dashboard: {
    titulo_hero: "Propulsez vos études avec l'intelligence académique.",
    subtitulo_hero: "Brain Studio • Assistant d'Apprentissage",
    energia: "Énergie",
    ofensiva_dias: "Série de {{count}} jours",
    ofensiva_aviso_migracao: "Nous avons ajusté le compte pour n'inclure que les jours réels d'étude.",
    progresso_geral: "Progression Globale",
    mascote_label: "Mascotte Virtuelle",
    progresso_proximo_nivel: "Progression vers le Niveau Suivant",
    loja_pets: "Boutique des Mascottes",
    evoluir_pet: "Faire Évoluer",
    brincar_pet: "Jouer avec la Mascotte",
    conexao_permanente_ava: "Connexion Permanente au Portail",
    conexao_pendente_ava: "Connexion en Attente",
    atividades_prazos: "Devoirs et Échéances",
    atividades_pendentes: "{{count}} En Attente",
    entregue: "Rendu",
    prazo: "Échéance : {{data}}",
    nenhuma_atividade: "Aucun devoir enregistré pour le moment.",
    horarios_aulas: "Emploi du Temps",
    minhas_materias: "Mes Matières",
    disciplinas_count: "({{count}} Cours)",
    nenhuma_materia: "Aucune matière enregistrée pour le moment",
    conectar_ava: "Accéder au Portail",
    gerenciar_materias: "Gérer les Cours",
    ver_trilhas: "Voir les Parcours",
    ativa: "Actif",
    excluir_materia: "Supprimer {{nome}}",
    desafio_patrocinado: "Défi d'Étude",
    tempo_restante: "Temps restant : {{tempo}}",
    recompensa: "Récompense : {{valor}}"
  },
  pet: {
    nome: "Nom de la Mascotte",
    especie: "Espèce",
    nivel: "Niveau",
    fome: "Faim",
    felicidade: "Bonheur",
    energia: "Énergie",
    alimentar: "Nourrir",
    brincar: "Jouer",
    dormir: "Dormir",
    acordar: "Réveiller",
    sem_comida: "Vous n'avez pas de nourriture dans votre inventaire !",
    alimentado_sucesso: "{{nome}} a été nourri avec succès !",
    brincou_sucesso: "{{nome}} a adoré jouer avec vous !",
    dormindo: "{{nome}} s'est endormi pour récupérer de l'énergie.",
    acordou: "{{nome}} est réveillé et prêt à étudier !",
    personalizar: "Garde-robe",
    trocar_mascote: "Changer de Mascotte"
  },
  lumina: {
    titulo: "Lumina IA",
    subtitulo: "Votre tutrice académique socratique et bienveillante",
    placeholder_input: "Posez une question sur vos cours ou collez un exercice...",
    enviar: "Envoyer",
    nivel_explicacao: "Niveau d'explication",
    nivel_simples: "Très Simple",
    nivel_normal: "Normal",
    nivel_tecnico: "Technique",
    modo_temporario: "Discussion Temporaire",
    modo_temporario_desc: "La discussion ne sera ni enregistrée ni mémorisée",
    limpar_historico: "Effacer l'historique",
    copiar_resposta: "Copier la réponse",
    resposta_copiada: "Réponse copiée dans le presse-papier !",
    gerar_quiz_arquivo: "Générer un quiz à partir d'un fichier",
    memoria_lumina: "Ce que Lumina sait sur moi",
    ouvir_resposta: "Écouter l'explication",
    parar_voz: "Arrêter la voix"
  },
  agenda: {
    titulo: "Emploi du Temps et Calendrier",
    subtitulo: "Organisez vos cours, examens et échéances scolaires",
    adicionar_evento: "Ajouter un Événement",
    sem_eventos: "Aucun événement prévu pour cette date.",
    hoje: "Aujourd'hui",
    semana: "Semaine",
    mes: "Mois"
  },
  tarefas: {
    titulo: "Mes Tâches d'Étude",
    subtitulo: "Gérez vos activités, devoirs et objectifs académiques",
    adicionar_placeholder: "Ajouter une nouvelle tâche...",
    adicionar_btn: "Ajouter Tâche",
    todas: "Toutes",
    pendentes: "En cours",
    concluidas: "Terminées",
    sem_tarefas: "Aucune tâche enregistrée. Commencez par en ajouter une ci-dessus !"
  },
  flashcards: {
    titulo: "Flashcards et Répétition Espacée",
    subtitulo: "Mémorisation active et efficace avec l'algorithme SM-2",
    novo_deck: "Nouveau Paquet",
    revisar_agora: "Réviser Maintenant",
    cartoes_pendentes: "{{count}} cartes à réviser",
    criar_cartao: "Créer une Carte",
    frente: "Recto (Question)",
    verso: "Verso (Réponse)"
  },
  sala_estudo: {
    titulo: "Salle d'Étude Virtuelle",
    subtitulo: "Concentration profonde en direct avec ambiance sonore et technique Pomodoro",
    iniciar_foco: "Démarrer le Focus",
    pausar_foco: "Mettre en Pause",
    tempo_restante: "Temps Restant",
    som_ambiente: "Son d'Ambiance",
    chuva: "Pluie Douce",
    floresta: "Forêt Paisible",
    cafeteria: "Café d'Étude",
    ondas: "Vagues de l'Océan",
    silencio: "Silence Total"
  },
  loja: {
    titulo: "Boutique Académique",
    subtitulo: "Échangez vos pièces méritées contre des objets pour vos mascottes et votre profil",
    saldo_moedas: "Votre Solde",
    comprar: "Acheter",
    comprado: "Débloqué",
    preco: "{{valor}} pièces",
    comida: "Nourriture",
    brinquedo: "Jouets",
    cosmeticos: "Cosmétiques",
    cenarios: "Arrière-plans",
    evolucao: "Évolution",
    saldo_insuficiente: "Pièces insuffisantes ! Étudiez davantage pour en gagner."
  },
  ajustes: {
    titulo: "Paramètres",
    subtitulo: "Personnalisez votre expérience, langue, apparence et compte",
    idioma: "Langue",
    aparencia: "Apparence",
    tema_claro: "Thème Clair",
    tema_escuro: "Thème Sombre",
    acessibilidade: "Accessibilité",
    fonte_dislexia: "Police OpenDyslexic",
    alto_contraste: "Contraste Élevé",
    leitura_voz: "Synthèse Vocale (TTS)",
    reduzir_animacoes: "Réduire les Animations",
    privacidade: "Confidentialité et Données",
    exportar_dados: "Exporter mes données",
    apagar_dados: "Supprimer mes données",
    sobre: "À Propos du Brain Studio",
    versao: "Version 1.0.0 Commerciale"
  },
  erros: {
    generico: "Une erreur inattendue est survenue.",
    conexao: "Vérifiez votre connexion internet.",
    mic_nao_suportado: "Reconnaissance vocale non supportée sur ce navigateur.",
    arquivo_muito_grande: "Le fichier dépasse la taille maximale de 10 Mo.",
    cota_excedida: "Limite atteinte pour votre forfait actuel."
  }
};

// Completar chaves faltantes a partir de en.json para garantir 100% de paridade estrutural
function mergeWithFallback(target, fallback) {
  const result = { ...fallback };
  for (const [k, v] of Object.entries(target)) {
    if (v && typeof v === "object" && !Array.isArray(v) && fallback[k]) {
      result[k] = mergeWithFallback(v, fallback[k]);
    } else {
      result[k] = v;
    }
  }
  return result;
}

const frComplete = mergeWithFallback(frBase, en);
fs.writeFileSync("./src/locales/fr.json", JSON.stringify(frComplete, null, 2), "utf-8");
console.log("✅ fr.json criado com 100% de cobertura estrutural");
