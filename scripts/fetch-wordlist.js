#!/usr/bin/env node
const https = require("https");
const fs = require("fs");
const path = require("path");

const URL =
  "https://raw.githubusercontent.com/chmduquesne/diceware-fr/master/tails/wordlist_fr_7776.txt";
const OUT_TXT = path.join(__dirname, "..", "wordlist_fr_7776.txt");
const OUT_JSON = path.join(__dirname, "..", "public", "wordlist.json");

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
          return fetch(res.headers.location).then(resolve, reject);
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

function parse(raw) {
  const words = [];
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const parts = t.split(/[\t ]+/);
    if (parts.length >= 2) words.push(parts[1]);
    else if (parts.length === 1 && /^[a-zA-ZÀ-ÿ\-']+$/.test(parts[0]))
      words.push(parts[0]);
  }
  return words;
}

async function main() {
  // Check if local txt already exists
  let raw;
  if (fs.existsSync(OUT_TXT)) {
    console.log("📁 Fichier local trouvé:", OUT_TXT);
    raw = fs.readFileSync(OUT_TXT, "utf-8");
  } else {
    console.log("⏳ Téléchargement de la wordlist...");
    raw = await fetch(URL);
    fs.writeFileSync(OUT_TXT, raw, "utf-8");
    console.log("💾 Sauvegardé:", OUT_TXT);
  }

  const words = parse(raw);
  console.log(`📝 ${words.length} mots parsés`);

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(words));
  console.log("✅ Wordlist JSON:", OUT_JSON);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
