import fs from "fs";
import path from "path";

const locales = ["pt-BR", "pt-PT", "en", "en-GB", "es", "fr"];

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
  const ptPath = path.resolve(process.cwd(), "src/locales/pt-BR.json");
  const ptData = JSON.parse(fs.readFileSync(ptPath, "utf-8"));
  const ptKeys = new Set(flattenKeys(ptData));

  console.log(`\n🔍 Verificação de I18n no Brain Studio (Fase 1):`);
  console.log(`- Matriz pt-BR: ${ptKeys.size} chaves`);

  let hasErrors = false;

  for (const loc of locales) {
    if (loc === "pt-BR") continue;
    const locPath = path.resolve(process.cwd(), `src/locales/${loc}.json`);
    if (!fs.existsSync(locPath)) {
      console.error(`❌ Arquivo ausente: src/locales/${loc}.json`);
      hasErrors = true;
      continue;
    }

    const locData = JSON.parse(fs.readFileSync(locPath, "utf-8"));
    const locKeys = new Set(flattenKeys(locData));
    console.log(`- ${loc}: ${locKeys.size} chaves`);

    const missing = [...ptKeys].filter((k) => !locKeys.has(k));
    if (missing.length > 0) {
      console.warn(`❌ Faltando em ${loc}.json (${missing.length}):`, missing.slice(0, 5));
      hasErrors = true;
    }
  }

  if (!hasErrors) {
    console.log("\n✅ Todas as chaves de tradução estão 100% sincronizadas entre pt-BR, pt-PT, en, en-GB, es e fr!");
  } else {
    process.exitCode = 1;
  }
} catch (err: any) {
  console.error("Erro ao verificar i18n:", err.message);
  process.exit(1);
}
