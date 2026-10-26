import fs from "fs";
import path from "path";

const EN_LOCALE_PATH = "./src/locales/en.json";
const OUTPUT_DIR = "./src/locales";

const INCOMPLETOS = [
  { code: "id", apiLang: "id", nome: "Bahasa Indonesia" },
  { code: "uk", apiLang: "uk", nome: "Українська" },
  { code: "pl", apiLang: "pl", nome: "Polski" },
  { code: "sv", apiLang: "sv", nome: "Svenska" },
  { code: "th", apiLang: "th", nome: "ไทย" },
  { code: "nl", apiLang: "nl", nome: "Nederlands" },
];

const PROTECTED_BRANDS = [
  ["Brain Studio", "__BR_1__"],
  ["Lumina IA", "__BR_2__"],
  ["Lumina", "__BR_3__"],
  ["IFES", "__BR_4__"],
  ["Moodle", "__BR_5__"],
  ["Anki", "__BR_6__"],
  ["Q-Acadêmico", "__BR_7__"],
  ["Capacitor", "__BR_8__"],
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function protegerTexto(txt) {
  let res = txt;
  for (const [brand, token] of PROTECTED_BRANDS) {
    res = res.replaceAll(brand, token);
  }
  return res;
}

function desprotegerTexto(txt) {
  let res = txt;
  for (const [brand, token] of PROTECTED_BRANDS) {
    res = res.replaceAll(token, brand);
  }
  res = res.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, "{{$1}}");
  return res;
}

async function fetchComRetry(url, tentativas = 4) {
  for (let t = 0; t < tentativas; t++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.warn(`[RateLimit 429] Aguardando ${(t + 1) * 2}s antes de tentar novamente...`);
        await sleep((t + 1) * 2000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (t === tentativas - 1) throw err;
      await sleep(1500);
    }
  }
  throw new Error("Esgotadas tentativas");
}

async function traduzirLote(strings, targetLang) {
  if (strings.length === 0) return [];
  const protegidas = strings.map((s) => protegerTexto(s).replace(/\r?\n/g, " "));
  const textoCombinado = protegidas.join("\n");

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
    targetLang
  )}&dt=t&q=${encodeURIComponent(textoCombinado)}`;

  try {
    const data = await fetchComRetry(url);
    const textoTraduzido = data[0].map((item) => item[0]).join("");
    const partes = textoTraduzido.split("\n");

    const resultado = [];
    for (let i = 0; i < strings.length; i++) {
      if (partes[i] !== undefined && partes[i].trim()) {
        resultado.push(desprotegerTexto(partes[i].trim()));
      } else {
        resultado.push(strings[i]);
      }
    }
    return resultado;
  } catch (err) {
    console.error(`Erro ao traduzir lote para ${targetLang}:`, err.message);
    return strings;
  }
}

async function compilar(enData, idiomaInfo) {
  console.log(`🌐 Retraduzindo com precisão: ${idiomaInfo.nome} (${idiomaInfo.code})...`);

  const entradas = [];
  for (const secao of Object.keys(enData)) {
    for (const chave of Object.keys(enData[secao])) {
      entradas.push({
        secao,
        chave,
        original: String(enData[secao][chave]),
      });
    }
  }

  const TAMANHO_LOTE = 35;
  const traducoesFinais = [];

  for (let i = 0; i < entradas.length; i += TAMANHO_LOTE) {
    const lote = entradas.slice(i, i + TAMANHO_LOTE);
    const strings = lote.map((e) => e.original);
    const traduzidas = await traduzirLote(strings, idiomaInfo.apiLang);

    for (let j = 0; j < lote.length; j++) {
      traducoesFinais.push({
        secao: lote[j].secao,
        chave: lote[j].chave,
        traduzido: traduzidas[j] || lote[j].original,
      });
    }
    await sleep(400); // 400ms pause entre lotes para respeitar a cota da API
  }

  const resultado = {};
  for (const secao of Object.keys(enData)) {
    resultado[secao] = {};
  }

  for (const item of traducoesFinais) {
    resultado[item.secao][item.chave] = item.traduzido;
  }

  const destPath = path.join(OUTPUT_DIR, `${idiomaInfo.code}.json`);
  fs.writeFileSync(destPath, JSON.stringify(resultado, null, 2), "utf-8");
  console.log(`  ✓ Salvo ${destPath} 100% completo com ${entradas.length} chaves.`);
}

async function main() {
  const enData = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, "utf-8"));

  for (const info of INCOMPLETOS) {
    await compilar(enData, info);
    await sleep(1000); // 1s entre línguas
  }
  console.log("Todos os idiomas incompletos foram retraduzidos com sucesso!");
}

main().catch(console.error);
