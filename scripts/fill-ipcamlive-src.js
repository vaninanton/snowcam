/**
 * Для всех записей в src/videos.js с полем player запрашивает страницу плеера,
 * извлекает address и streamid, собирает URL m3u8 и подставляет в src.
 * Запуск из корня проекта: node scripts/fill-ipcamlive-src.js
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEOS_PATH = path.join(__dirname, "..", "src", "videos.js");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://g2.ipcamlive.com/",
};

const ADDRESS_REGEX = /var\s+address\s*=\s*['"]([^'"]+)['"]/;
const STREAMID_REGEX = /var\s+streamid\s*=\s*['"]([^'"]+)['"]/;

function extractM3u8FromHtml(html) {
  const addressMatch = html.match(ADDRESS_REGEX);
  const streamidMatch = html.match(STREAMID_REGEX);
  if (!addressMatch || !streamidMatch) return null;
  let base = addressMatch[1].trim().replace(/\/$/, "");
  if (base.startsWith("http://")) base = base.replace("http://", "https://");
  else if (!base.startsWith("https://")) base = `https://${base}`;
  const streamId = streamidMatch[1].trim();
  return `${base}/streams/${streamId}/stream.m3u8`;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchM3u8ForPlayerUrl(playerUrl) {
  try {
    const res = await fetch(playerUrl, { headers: HEADERS });
    const html = await res.text();
    const m3u8 = extractM3u8FromHtml(html);
    return { m3u8, ok: res.ok };
  } catch (err) {
    return { m3u8: null, error: err.message };
  }
}

async function main() {
  const content = readFileSync(VIDEOS_PATH, "utf8");

  // Находим все блоки с player и пустым src (регулярка: player + следующий за ним src: "")
  const playerSrcEmptyRegex = /player:\s*"((?:[^"\\]|\\.)*)"\s*,\s*src:\s*""/g;
  const matches = [...content.matchAll(playerSrcEmptyRegex)];
  if (matches.length === 0) {
    console.log("Нет записей с player и пустым src.");
    return;
  }

  let newContent = content;
  for (const match of matches) {
    const playerUrl = match[1].replace(/\\"/g, '"');
    const fullMatch = match[0];
    process.stdout.write(`Fetch ${playerUrl.slice(0, 50)}... `);
    const { m3u8, error } = await fetchM3u8ForPlayerUrl(playerUrl);
    if (m3u8) {
      // Заменяем только этот конкретный фрагмент (player: "url", src: "" -> src: "m3u8")
      const replacement = fullMatch.replace(/src:\s*""/, `src: "${m3u8}"`);
      newContent = newContent.replace(fullMatch, replacement);
      console.log(m3u8);
    } else {
      console.log(`(не найден) ${error || ""}`);
    }
  }

  writeFileSync(VIDEOS_PATH, newContent, "utf8");
  console.log("\nОбновлён src/videos.js");
}

main().catch(console.error);
