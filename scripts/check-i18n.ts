import fs from "fs";
import path from "path";

// Carregar arquivos de tradução
const ptPath = path.resolve(process.cwd(), "src/locales/pt-BR.json");
const enPath = path.resolve(process.cwd(), "src/locales/en.json");
const esPath = path.resolve(process.cwd(), "src/locales/es.json");

function flattenKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys = keys.concat(flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

try {
  const ptData = JSON.parse(fs.readFileSync(ptPath, "utf-8"));
  const enData = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const esData = JSON.parse(fs.readFileSync(esPath, "utf-8"));

  const ptKeys = new Set(flattenKeys(ptData));
  const enKeys = new Set(flattenKeys(enData));
  const esKeys = new Set(flattenKeys(esData));

  console.log(`\n🔍 Verificação de I18n no Brain Studio:`);
  console.log(`- pt-BR chaves totais: ${ptKeys.size}`);
  console.log(`- en chaves totais: ${enKeys.size}`);
  console.log(`- es chaves totais: ${esKeys.size}\n`);

  let hasErrors = false;

  // Comparar EN com PT
  const missingInEn = [...ptKeys].filter((k) => !enKeys.has(k));
  const extraInEn = [...enKeys].filter((k) => !ptKeys.has(k));

  if (missingInEn.length > 0) {
    console.warn(`❌ Faltando em en.json (${missingInEn.length}):`, missingInEn);
    hasErrors = true;
  }
  if (extraInEn.length > 0) {
    console.warn(`⚠️ Chaves sobrando em en.json (${extraInEn.length}):`, extraInEn);
  }

  // Comparar ES com PT
  const missingInEs = [...ptKeys].filter((k) => !esKeys.has(k));
  const extraInEs = [...esKeys].filter((k) => !ptKeys.has(k));

  if (missingInEs.length > 0) {
    console.warn(`❌ Faltando em es.json (${missingInEs.length}):`, missingInEs);
    hasErrors = true;
  }
  if (extraInEs.length > 0) {
    console.warn(`⚠️ Chaves sobrando em es.json (${extraInEs.length}):`, extraInEs);
  }

  if (!hasErrors) {
    console.log("✅ Todas as chaves de tradução estão 100% sincronizadas entre pt-BR, en e es!");
  } else {
    process.exitCode = 1;
  }
} catch (err: any) {
  console.error("Erro ao verificar i18n:", err.message);
  process.exit(1);
}
