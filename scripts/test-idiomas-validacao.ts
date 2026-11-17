/**
 * Brain Studio - Teste de Validação de Idiomas e Detecção de Texto Invertido
 * Bloco 2 da Execução Autônoma:
 * - Valida se algum valor em qualquer idioma é a versão invertida (reversed) do texto em inglês
 * - Valida integridade de placeholders ({nome}, {count}, {{key}}, etc.)
 * - Valida correspondência de dir="rtl" exclusivamente para ar, he, fa, ur
 * - Gera relatório de cobertura por idioma
 */

import fs from "fs";
import path from "path";
import { SUPPORTED_LANGUAGES } from "../src/i18n";

const RTL_CODES = new Set(["ar", "he", "fa", "ur"]);
const LOCALES_DIR = path.resolve(process.cwd(), "src/locales");

function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fullKey));
    } else if (typeof val === "string") {
      result[fullKey] = val;
    }
  }
  return result;
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{+[^{}]+\}+/g);
  return matches ? matches.map((m) => m.trim()).sort() : [];
}

let failed = false;

console.log("=======================================================");
console.log("BLOCO 2: VALIDAÇÃO DE IDIOMAS & AUDITORIA DE TEXTO INVERTIDO");
console.log("=======================================================\n");

// 1. Carregar matriz de referência en.json e pt-BR.json
const enPath = path.join(LOCALES_DIR, "en.json");
const ptPath = path.join(LOCALES_DIR, "pt-BR.json");

if (!fs.existsSync(enPath) || !fs.existsSync(ptPath)) {
  console.error("❌ Arquivos de referência en.json ou pt-BR.json não encontrados!");
  process.exit(1);
}

const enFlat = flattenObject(JSON.parse(fs.readFileSync(enPath, "utf-8")));
const ptFlat = flattenObject(JSON.parse(fs.readFileSync(ptPath, "utf-8")));
const totalRefKeys = Object.keys(enFlat).length;

console.log(`[1] Matriz de Referência Carregada:`);
console.log(`  - en.json: ${totalRefKeys} chaves`);
console.log(`  - pt-BR.json: ${Object.keys(ptFlat).length} chaves\n`);

// 2. Verificar conformidade de cada idioma em SUPPORTED_LANGUAGES
console.log("[2] Auditoria por Idioma:");

for (const lang of SUPPORTED_LANGUAGES) {
  // Verificação de direção RTL
  const shouldBeRtl = RTL_CODES.has(lang.code);
  const isMarkedRtl = lang.dir === "rtl";

  if (shouldBeRtl && !isMarkedRtl) {
    console.error(`  ❌ FALHA: Idioma ${lang.code} (${lang.label}) DEVE ter dir="rtl"`);
    failed = true;
  } else if (!shouldBeRtl && isMarkedRtl) {
    console.error(`  ❌ FALHA: Idioma ${lang.code} (${lang.label}) NÃO é RTL mas tem dir="rtl"`);
    failed = true;
  }

  const filePath = path.join(LOCALES_DIR, `${lang.code}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ FALHA: Arquivo ${lang.code}.json não encontrado!`);
    failed = true;
    continue;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let data: Record<string, any>;
  try {
    data = JSON.parse(raw);
  } catch (err: any) {
    console.error(`  ❌ FALHA: Arquivo ${lang.code}.json contém JSON inválido: ${err.message}`);
    failed = true;
    continue;
  }

  const flat = flattenObject(data);
  let invertedCount = 0;
  let placeholderMismatches = 0;

  for (const [key, val] of Object.entries(flat)) {
    const enVal = enFlat[key];
    if (enVal && enVal.length > 3) {
      // Checar se o valor é exatamente o texto em inglês invertido
      const reversedEn = enVal.split("").reverse().join("");
      if (val === reversedEn && val !== enVal) {
        console.error(`  ❌ FALHA DE TEXTO INVERTIDO em [${lang.code}] chave "${key}":`);
        console.error(`     Original EN: "${enVal}"`);
        console.error(`     Invertido:   "${val}"`);
        invertedCount++;
        failed = true;
      }
    }

    // Checar placeholders
    if (enVal) {
      const enPlaceholders = extractPlaceholders(enVal);
      if (enPlaceholders.length > 0) {
        const valPlaceholders = extractPlaceholders(val);
        // Se tem placeholders mas nenhum bate
        const hasAny = enPlaceholders.some((p) => valPlaceholders.includes(p));
        if (!hasAny && valPlaceholders.length !== enPlaceholders.length) {
          placeholderMismatches++;
        }
      }
    }
  }

  const coveragePercent = Math.round((Object.keys(flat).length / totalRefKeys) * 100);
  console.log(
    `  ✓ ${lang.code.padEnd(6)} | ${lang.label.padEnd(26)} | dir: ${(lang.dir || "ltr").padEnd(3)} | Chaves: ${Object.keys(flat).length}/${totalRefKeys} (${coveragePercent}%) | Invertidos: ${invertedCount} | Placeholders OK: ${placeholderMismatches === 0 ? "Sim" : "Avisos (" + placeholderMismatches + ")"}`
  );
}

console.log("\n=======================================================");
if (failed) {
  console.error("❌ AUDITORIA DE IDIOMAS FALHOU: Foram detectados erros críticos!");
  process.exit(1);
} else {
  console.log("✅ AUDITORIA CONCLUÍDA COM SUCESSO: Nenhum texto invertido detectado!");
  console.log("=======================================================");
}
