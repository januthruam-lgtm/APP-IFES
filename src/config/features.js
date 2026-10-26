/**
 * Brain Studio - Sistema Central de Feature Flags
 * Controla a ativação modular e progressiva de cada fase do produto comercial.
 * Permite lançar e testar incrementalmente cada recurso sem quebrar o código estável.
 */

export const FEATURES = Object.freeze({
  // Fase 0: Fundação, auditoria e arquitetura modular
  fase0_fundacao: true,

  // Fase 1: Sistema universal de idiomas sem dependência externa
  fase1_idiomas: true,

  // Fase 2: Temas restritos exclusivamente a Claro e Escuro
  fase2_temas: true,

  // Fase 3: Exclusão persistente de matérias com soft-delete e tombstones
  fase3_materias_excluidas: false,

  // Fase 4: Economia acadêmica (Baú da equipe, missões, ofensiva, ligas e loja)
  fase4_economia: false,
  fase4a_bau_equipe: false,
  fase4b_missoes_ofensiva: false,
  fase4c_ligas_semanais: false,
  fase4d_loja_sumidouros: false,

  // Fase 5: Estrutura comercial de Planos (Gratuito, Lite, Pro)
  fase5_planos: false,

  // Fase 6: Cidade do Conhecimento (progressão acadêmica sem sorteio e sem ataque)
  fase6_cidade: true,

  // Fase 7: Suporte Multi-Instituição (Inep, e-MEC, ROR e conexão agnóstica de AVA)
  fase7_multi_instituicao: true,
  multiInstituicao: true,

  // Fase 8: Lumina IA (tutora acolhedora, memória consentida e segurança em profundidade)
  fase8_lumina: true,

  // Fase 9: Gerador de Quiz por Arquivo (validação binária e cotas por plano)
  fase9_quiz_arquivo: true,

  // Fase 10: Cursos Preparatórios Originais (ENEM, vestibulares e programação)
  fase10_cursos: true,

  // Fase 11: Biblioteca Virtual com 250+ Obras em Domínio Público e Dicionário
  fase11_biblioteca_dicionario: true,

  // Fase 12: Guarda-roupa dos Mascotes 3D (acessórios estéticos sem vantagem de jogo)
  fase12_guarda_roupa: false,

  // Fase 13: Profissionalização, observabilidade e pacote Google Play AAB
  fase13_lancamento: false,
});

/**
 * Verifica se uma determinada funcionalidade está ativa no momento.
 * @param {string} featureKey Chave da funcionalidade em FEATURES
 * @returns {boolean} True se a funcionalidade estiver ativada
 */
export function isFeatureEnabled(featureKey) {
  if (typeof window !== "undefined") {
    // Permite override via localStorage para testes locais e homologação
    const override = localStorage.getItem(`brain_feature_${featureKey}`);
    if (override !== null) {
      return override === "true" || override === "1";
    }
  }
  return Boolean(FEATURES[featureKey]);
}

export default FEATURES;
