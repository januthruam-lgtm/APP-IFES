import fs from "fs";
import path from "path";
import { SUPPORTED_LANGUAGES } from "../src/i18n";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    throw new Error(message);
  }
  passedTests++;
  console.log(`  ✓ ${message}`);
}

const SAMPLE_KEYS = [
  ["comum", "salvar"],
  ["comum", "cancelar"],
  ["comum", "fechar"],
  ["comum", "voltar"],
  ["comum", "continuar"],
  ["comum", "concluir"],
  ["comum", "pesquisar"],
  ["dashboard", "titulo_hero"],
  ["dashboard", "energia"],
  ["loja", "titulo"],
  ["simulados", "titulo"],
  ["chat_direto", "titulo"],
  ["auth", "titulo"],
  ["ajustes", "aparencia"],
  ["sala_estudo", "titulo"],
  ["sala_estudo", "subtitulo"],
  ["sala_estudo", "foco_ativo"],
  ["sala_estudo", "definir_meta"],
  ["flashcards", "titulo"],
  ["nav", "dashboard"],
];

async function runRtlAndInversionTests() {
  console.log("\n=======================================================");
  console.log("TESTES DE I18N, RTL E TEXTO NÃO INVERTIDO (BLOCO 2)");
  console.log("=======================================================");

  const rtlExpected = new Set(["ar", "he", "fa", "ur"]);
  const localesDir = path.resolve(process.cwd(), "src/locales");

  console.log("\n[1] Verificação de Direcionalidade (RTL vs LTR):");
  assert(SUPPORTED_LANGUAGES.length === 25, "Exatamente 25 idiomas catalogados");

  for (const lang of SUPPORTED_LANGUAGES) {
    const isRtlLang = rtlExpected.has(lang.code);
    if (isRtlLang) {
      assert(lang.dir === "rtl", `Idioma RTL ${lang.code} (${lang.label}) possui dir='rtl'`);
    } else {
      assert(lang.dir === "ltr", `Idioma LTR ${lang.code} (${lang.label}) possui dir='ltr' e NUNCA 'rtl'`);
    }
  }

  console.log("\n[2] Amostragem de 20 Textos por Idioma e Ausência de Texto Invertido:");
  for (const lang of SUPPORTED_LANGUAGES) {
    const filePath = path.join(localesDir, `${lang.code}.json`);
    assert(fs.existsSync(filePath), `Arquivo ${lang.code}.json existe no disco`);

    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const [section, key] of SAMPLE_KEYS) {
      const val = content[section]?.[key];
      assert(
        typeof val === "string" && val.trim().length > 0,
        `[${lang.code}] ${section}.${key} possui texto válido e preenchido`
      );

      // Verificação de ausência de bidi-override malicioso ou caracteres de inversão artificial
      assert(
        !val.includes("\u202E") && !val.includes("\u202D"),
        `[${lang.code}] ${section}.${key} não contém caracteres de bidi-override (\u202E/\u202D)`
      );

      // Verificações específicas por alfabeto
      if (lang.code === "ar" || lang.code === "fa" || lang.code === "ur") {
        // Alfabeto árabe-persa-urdu deve conter caracteres na faixa \u0600-\u06FF (ou emojis/pontuações)
        const hasArabic = /[\u0600-\u06FF]/.test(val);
        assert(hasArabic, `[${lang.code}] ${section}.${key} contém caracteres reais em script árabe-persa-urdu`);
      } else if (lang.code === "he") {
        // Alfabeto hebraico deve conter caracteres na faixa \u0590-\u05FF
        const hasHebrew = /[\u0590-\u05FF]/.test(val);
        assert(hasHebrew, `[he] ${section}.${key} contém caracteres reais em script hebraico`);
      } else if (lang.code === "ru" || lang.code === "uk") {
        const hasCyrillic = /[\u0400-\u04FF]/.test(val);
        assert(hasCyrillic, `[${lang.code}] ${section}.${key} contém caracteres cirílicos`);
      } else if (lang.code === "ja") {
        const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(val);
        assert(hasJapanese, `[ja] ${section}.${key} contém caracteres japoneses (Hiragana/Katakana/Kanji)`);
      } else if (lang.code === "zh") {
        const hasChinese = /[\u4E00-\u9FAF]/.test(val);
        assert(hasChinese, `[zh] ${section}.${key} contém caracteres chineses (Han)`);
      } else if (lang.code === "ko") {
        const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(val);
        assert(hasKorean, `[ko] ${section}.${key} contém caracteres coreanos (Hangul)`);
      } else if (lang.code === "th") {
        const hasThai = /[\u0E00-\u0E7F]/.test(val);
        assert(hasThai, `[th] ${section}.${key} contém caracteres tailandeses`);
      } else if (lang.code === "hi") {
        const hasHindi = /[\u0900-\u097F]/.test(val);
        assert(hasHindi, `[hi] ${section}.${key} contém caracteres Devanagari`);
      }
    }
  }

  console.log("\n[3] Verificação de Fallback para Inglês e Regras de CSS:");
  const cssPath = path.resolve(process.cwd(), "src/index.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  assert(css.includes('html[dir="rtl"]') && css.includes('body[dir="rtl"]'), "CSS contém regras para html[dir='rtl'] e body[dir='rtl']");
  assert(!css.includes("unicode-bidi: bidi-override"), "CSS NÃO usa unicode-bidi: bidi-override (proibido)");
  assert(css.includes("transform: scaleX(-1)"), "CSS espelha ícones direcionais em RTL");
  assert(css.includes("Noto Sans Arabic") && css.includes("Noto Sans Hebrew"), "CSS declara fontes Noto Sans para árabe e hebraico");

  console.log("\n=======================================================");
  console.log(`TOTAL: ${totalTests} TESTES DE I18N | APROVADOS: ${passedTests}`);
  console.log("=======================================================");
}

runRtlAndInversionTests().catch((err) => {
  console.error("Erro fatal no teste de i18n:", err);
  process.exit(1);
});
