const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 14714;
const BASE = "/dicepass";

// ── Load wordlist ──────────────────────────────────────────────────────
const jsonPath = path.join(__dirname, "public", "wordlist.json");
if (!fs.existsSync(jsonPath)) {
  console.error("❌ wordlist.json introuvable. Lancez d'abord : npm run setup");
  process.exit(1);
}
const wordlist = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
console.log(`📝 ${wordlist.length} mots chargés`);

// ── Passphrase generation (server-side for API) ────────────────────────
function generate(opts = {}) {
  const {
    words: n = 6,
    separator = "-",
    casing = "lower",
    addDigit = false,
    addSymbol = false,
  } = opts;

  const picked = [];
  for (let i = 0; i < n; i++) {
    let w = wordlist[crypto.randomInt(wordlist.length)];
    if (casing === "capitalize") w = w[0].toUpperCase() + w.slice(1);
    else if (casing === "upper") w = w.toUpperCase();
    picked.push(w);
  }

  let pass = picked.join(separator);
  if (addDigit) pass += crypto.randomInt(10);
  if (addSymbol) {
    const sym = "!@#$%&*?";
    pass += sym[crypto.randomInt(sym.length)];
  }

  let entropy = Math.log2(wordlist.length) * n;
  if (addDigit) entropy += Math.log2(10);
  if (addSymbol) entropy += Math.log2(8);

  return { passphrase: pass, entropy_bits: +entropy.toFixed(1) };
}

function crackTime(bits) {
  const s = Math.pow(2, bits) / 1e12 / 2;
  if (s < 1) return "< 1 seconde";
  if (s < 60) return `${Math.round(s)} secondes`;
  if (s < 3600) return `${Math.round(s / 60)} minutes`;
  if (s < 86400) return `${Math.round(s / 3600)} heures`;
  const d = 86400, y = d * 365.25;
  if (s < y) return `${Math.round(s / d)} jours`;
  if (s < y * 1e3) return `${Math.round(s / y)} ans`;
  if (s < y * 1e6) return `${(s / (y * 1e3)).toFixed(0)} milliers d'années`;
  if (s < y * 1e9) return `${(s / (y * 1e6)).toFixed(0)} millions d'années`;
  return `${(s / (y * 1e9)).toFixed(0)} milliards d'années`;
}

// ── Random password generation (server-side for API) ──────────────────
function generateRandom(opts = {}) {
  const {
    length = 16,
    upper = true,
    lower = true,
    digits = true,
    symbols = false,
  } = opts;

  const chars = [
    lower   ? "abcdefghijklmnopqrstuvwxyz" : "",
    upper   ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
    digits  ? "0123456789" : "",
    symbols ? "!@#$%&*?-_." : "",
  ].join("");

  if (!chars) return null;

  let pass = "";
  for (let i = 0; i < length; i++) pass += chars[crypto.randomInt(chars.length)];
  const entropy = +(Math.log2(chars.length) * length).toFixed(1);
  return { password: pass, entropy_bits: entropy, charset_size: chars.length };
}

// ── API endpoint — random password ────────────────────────────────────
app.get(`${BASE}/api/random`, (req, res) => {
  const q = req.query;
  const length  = Math.min(Math.max(parseInt(q.length) || 16, 8), 64);
  const upper   = q.upper   !== "0";
  const lower   = q.lower   !== "0";
  const digits  = q.digits  !== "0";
  const symbols = q.symbols === "1";
  const count   = Math.min(Math.max(parseInt(q.count) || 1, 1), 20);

  const results = Array.from({ length: count }, () =>
    generateRandom({ length, upper, lower, digits, symbols })
  );
  if (!results[0]) return res.status(400).json({ error: "Au moins un jeu de caractères requis." });

  const entropy = results[0].entropy_bits;

  res.set("Cache-Control", "no-store");
  res.json({
    passwords: results.map((r) => r.password),
    length,
    charset_size: results[0].charset_size,
    entropy_bits: entropy,
    crack_time: crackTime(entropy),
  });
});

// ── API endpoint — passphrase ──────────────────────────────────────────
app.get(`${BASE}/api`, (req, res) => {
  const q = req.query;
  const words = Math.min(Math.max(parseInt(q.words) || 6, 3), 12);
  const separator = q.sep !== undefined ? q.sep : "-";
  const casing = ["lower", "capitalize", "upper"].includes(q.case) ? q.case : "lower";
  const addDigit = q.digit === "1";
  const addSymbol = q.symbol === "1";
  const count = Math.min(Math.max(parseInt(q.count) || 1, 1), 20);

  const results = Array.from({ length: count }, () =>
    generate({ words, separator, casing, addDigit, addSymbol })
  );

  const entropy = results[0].entropy_bits;

  res.set("Cache-Control", "no-store");
  res.json({
    passphrases: results.map((r) => r.passphrase),
    words,
    separator,
    casing,
    entropy_bits: entropy,
    crack_time: crackTime(entropy),
    wordlist_size: wordlist.length,
  });
});

// ── Serve static (Web UI) ──────────────────────────────────────────────
app.use(BASE, express.static(path.join(__dirname, "public")));

// Catch-all for /dicepass sub-routes → SPA
app.get(`${BASE}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Root redirect ──────────────────────────────────────────────────────
app.get("/", (req, res) => res.redirect(BASE));

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎲 DicePass FR`);
  console.log(`   Web  : http://localhost:${PORT}${BASE}`);
  console.log(`   API  : http://localhost:${PORT}${BASE}/api`);
  console.log(`   ${wordlist.length} mots — ${Math.log2(wordlist.length).toFixed(2)} bits/mot\n`);
});
