# Code Route TN

Application web d'entraînement au **code de la route tunisien** (épreuve théorique / ATTT).
QCM par catégories, bilingue **français / arabe**, correction immédiate, examen blanc chronométré
et progression locale — dans un design ancré dans l'univers **route & signalisation**.

### ▶︎ Démo en ligne : **https://code-route-tn.pages.dev**

![Aperçu](docs/screenshots/hu-01-hero.png)

## Fonctionnalités
- **Toutes les catégories de permis** : moto (A), voiture (B), tracteur (G), poids lourd (C/CE),
  bus (D), remorques (BE/DE) — via un sélecteur de catégorie. **~11 300 questions**.
- **Bilingue FR / AR** : chaque examen existe en français et en arabe, basculable d'un clic
  (repli automatique en arabe pour les catégories sans version française).
- **Quiz visuel** : photo de la scène + énoncé en image + réponses أ / ب / ج (2 ou 3 choix
  détectés automatiquement) + correction visuelle.
- **Examen blanc** chronométré par catégorie (30 questions, 20 min, seuil 24/30 comme le jour J).
- **Examens VIP** (Royal, Marathon, Spécial éliminatoires) — section premium.
- **Révision des erreurs**, **questions éliminatoires** signalées, **progression locale**
  (XP, niveaux, série de jours, meilleurs scores) en `localStorage`.

## Stack
Vite + React 18, CSS maison (pas de framework UI), polices Archivo Expanded / Inter / Cairo (arabe).
Front 100 % statique → **Cloudflare Pages**. Les images des questions sont servies depuis
**Cloudflare R2** (bucket public).

## Architecture des données
- Le front charge `app/public/data/crt/index.json` (catalogue catégories + langues) et un
  `{CAT}.json` par catégorie (corrigés + URLs des images).
- Les **~34 000 images** (question / scène / réponse) vivent sur **R2** et ne sont pas embarquées
  dans le build (Cloudflare Pages plafonne à 20 000 fichiers).
- Pipeline de récupération + génération : voir **`scraper/README_codedelaroute.md`**.

## Développement
```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
```

## Déploiement (Cloudflare Pages)
```bash
cd app
npm run build
npx wrangler pages deploy dist --project-name=code-route-tn
```
`public/_redirects` gère le routing SPA. La page est en `noindex` (projet pédagogique / portfolio).

---
> Projet à but **pédagogique / portfolio**. Conçu par
> [Louey Barbirou](https://github.com/baluva).
