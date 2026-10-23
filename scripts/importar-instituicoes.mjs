#!/usr/bin/env node
/**
 * Brain Studio - Script de Importação e Normalização de Instituições
 * Fontes Oficiais:
 * - Brasil: Catálogo de Escolas Inep (dados abertos) & Cadastro e-MEC
 * - Mundo: ROR (Research Organization Registry) API / Dump
 *
 * Uso:
 *   node scripts/importar-instituicoes.mjs --pais=BR
 *   node scripts/importar-instituicoes.mjs --pais=PT
 *   node scripts/importar-instituicoes.mjs --all
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public", "instituicoes");

function normalizarTexto(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function deduplicar(instituicoes) {
  const vistos = new Set();
  const validos = [];
  let descartados = 0;
  const motivos = { semNome: 0, duplicadoCodigo: 0, duplicadoNomeCidade: 0 };

  for (const inst of instituicoes) {
    if (!inst.nome || inst.nome.trim().length === 0) {
      descartados++;
      motivos.semNome++;
      continue;
    }

    const codUnico = inst.codigos?.inep || inst.codigos?.emec || inst.codigos?.ror;
    if (codUnico && vistos.has(`cod:${codUnico}`)) {
      descartados++;
      motivos.duplicadoCodigo++;
      continue;
    }

    const chaveNomeCidade = `${normalizarTexto(inst.nome)}|${normalizarTexto(inst.cidade || "")}|${inst.pais}`;
    if (vistos.has(chaveNomeCidade)) {
      descartados++;
      motivos.duplicadoNomeCidade++;
      continue;
    }

    if (codUnico) vistos.add(`cod:${codUnico}`);
    vistos.add(chaveNomeCidade);
    validos.push(inst);
  }

  return { validos, descartados, motivos };
}

async function processarPais(paisIso) {
  const codigo = paisIso.toUpperCase();
  const filePath = path.join(OUTPUT_DIR, `${codigo}.json`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let dados = [];
  if (fs.existsSync(filePath)) {
    dados = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  console.log(`\n======================================================`);
  console.log(`Processando base para ${codigo}... Registros atuais: ${dados.length}`);

  const { validos, descartados, motivos } = deduplicar(dados);

  fs.writeFileSync(filePath, JSON.stringify(validos, null, 2), "utf-8");
  const stats = fs.statSync(filePath);
  const tamanhoKb = (stats.size / 1024).toFixed(1);

  console.log(`✓ Concluído ${codigo}.json:`);
  console.log(`  - Instituições ativas: ${validos.length}`);
  console.log(`  - Descartados: ${descartados} (sem nome: ${motivos.semNome}, duplicados: ${motivos.duplicadoCodigo + motivos.duplicadoNomeCidade})`);
  console.log(`  - Tamanho do arquivo: ${tamanhoKb} KB (meta: < 1500 KB)`);
  console.log(`======================================================\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const paisArg = args.find((a) => a.startsWith("--pais="))?.split("=")[1];

  if (paisArg) {
    await processarPais(paisArg);
  } else {
    // Processa os países com dados existentes
    await processarPais("BR");
    if (fs.existsSync(path.join(OUTPUT_DIR, "PT.json"))) {
      await processarPais("PT");
    }
  }
}

main().catch(console.error);
