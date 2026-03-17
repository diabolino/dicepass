# 🎲 DicePass — Générateur de passphrases Diceware FR

Interface web + API JSON pour générer des passphrases mémorables basées sur la méthode Diceware avec une liste française de 7776 mots.

## Stack

- **Serveur** : Node.js + Express
- **Frontend** : React 18 + Babel standalone + Tailwind CSS (CDN)
- **Crypto** : `crypto.getRandomValues()` côté client, `crypto.randomInt()` côté serveur (API)
- **Thème** : Dark / Light avec détection automatique
- **Régénération live** à chaque changement de paramètre

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Télécharger et parser la wordlist
npm run setup

# 3. Lancer le serveur
npm start
```

Le serveur écoute sur le port 3000 par défaut (`PORT=8080 npm start` pour changer).

## Routes

| Route | Description |
|---|---|
| `/dicepass` | Interface web (génération côté client) |
| `/dicepass/api` | API JSON (génération côté serveur) |

## API

```
GET /dicepass/api?words=6&sep=-&case=capitalize&count=3
```

| Paramètre | Défaut | Description |
|---|---|---|
| `words` | `6` | Nombre de mots (3–12) |
| `sep` | `-` | Séparateur |
| `case` | `lower` | `lower` / `capitalize` / `upper` |
| `digit` | `0` | Ajouter un chiffre (0 ou 1) |
| `symbol` | `0` | Ajouter un symbole (0 ou 1) |
| `count` | `1` | Nombre de résultats (1–20) |

### Exemple de réponse

```json
{
  "passphrases": [
    "Clavier-Herbe-Soleil-Marche-Banane-Plume"
  ],
  "words": 6,
  "entropy_bits": 77.5,
  "crack_time": "3 milliards d'années",
  "wordlist_size": 7776
}
```

## Config Nginx (reverse proxy)

```nginx
location /dicepass {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Wordlist

[chmduquesne/diceware-fr](https://github.com/chmduquesne/diceware-fr) — Licence CC-BY-3.0
