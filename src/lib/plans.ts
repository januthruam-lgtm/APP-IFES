export const ENTITLEMENT = "pro";

export const PLANS = {
  free: {
    id: "free",
    name: "Gratuito",
    luminaDailyLimit: 10,
  },
  pro: {
    id: "pro",
    name: "Brain Studio Pro",
    benefits: [
      "Perguntas ilimitadas para a Lumina",
      "Simulados e flashcards sem limite diário",
      "Pets e temas exclusivos",
      "Resumos estruturados avançados",
      "Apoia o desenvolvimento do app",
    ],
  },
};

// Só para exibição quando a loja ainda não respondeu.
// O preço real vem da Play Store.
export const FALLBACK_PRICES = {
  monthly: "R$ 9,90/mês",
  annual: "R$ 79,00/ano",
};