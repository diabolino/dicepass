# 🎲 DicePass — Générateur de mots de passe FR

Interface web + API JSON pour générer des mots de passe sécurisés : passphrases mémorables (méthode Diceware) ou mots de passe aléatoires classiques.

## Stack

- **Serveur** : Node.js + Express
- **Frontend** : React 18 + Babel standalone + Tailwind CSS (servis localement, sans CDN)
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

Le serveur écoute sur le port `14714` par défaut (`PORT=8080 npm start` pour changer).

## Routes

| Route | Description |
|---|---|
| `/dicepass` | Interface web (génération côté client) |
| `/dicepass/api` | API JSON — mode Diceware |
| `/dicepass/api/random` | API JSON — mode aléatoire |

## API — Mode Diceware

Génère des passphrases mémorables à partir d'une liste de 7776 mots français.

```
GET /dicepass/api?words=6&sep=-&case=capitalize&count=3
```

| Paramètre | Défaut | Description |
|---|---|---|
| `words` | `6` | Nombre de mots (3–12) |
| `sep` | `-` | Séparateur |
| `case` | `lower` | `lower` / `capitalize` / `upper` |
| `digit` | `0` | Ajouter un chiffre (`0` ou `1`) |
| `symbol` | `0` | Ajouter un symbole (`0` ou `1`) |
| `count` | `1` | Nombre de résultats (1–20) |

### Exemple de réponse

```json
{
  "passphrases": [
    "Clavier-Herbe-Soleil-Marche-Banane-Plume"
  ],
  "words": 6,
  "separator": "-",
  "casing": "capitalize",
  "entropy_bits": 77.5,
  "crack_time": "3 milliards d'années",
  "wordlist_size": 7776
}
```

## API — Mode Aléatoire

Génère des mots de passe aléatoires à partir d'un jeu de caractères configurable.

```
GET /dicepass/api/random?length=20&upper=1&lower=1&digits=1&symbols=0&count=5
```

| Paramètre | Défaut | Description |
|---|---|---|
| `length` | `16` | Longueur du mot de passe (8–64) |
| `upper` | `1` | Inclure les majuscules (`0` pour désactiver) |
| `lower` | `1` | Inclure les minuscules (`0` pour désactiver) |
| `digits` | `1` | Inclure les chiffres (`0` pour désactiver) |
| `symbols` | `0` | Inclure les symboles (`1` pour activer) |
| `count` | `1` | Nombre de résultats (1–20) |

### Exemple de réponse

```json
{
  "passwords": [
    "aB3kR7mXpQ2nLw8v"
  ],
  "length": 16,
  "charset_size": 62,
  "entropy_bits": 95.3,
  "crack_time": "milliards d'années"
}
```

## Config Nginx (reverse proxy)

Utiliser le modificateur `^~` pour que les fichiers statiques (JS, CSS) soient correctement servis avant les règles regex :

```nginx
location ^~ /dicepass {
    proxy_pass http://127.0.0.1:14714;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Wordlist

[chmduquesne/diceware-fr](https://github.com/chmduquesne/diceware-fr) — Licence CC-BY-3.0

## Licence

[MIT](LICENSE) © 2026 diabolino
