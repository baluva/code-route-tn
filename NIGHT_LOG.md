# Journal du travail de nuit — Code de la Route

Travail autonome (loop) pendant que tu dors, sur la branche **`nuit-23-06`**.
**Aucun déploiement** (produit payant) : tu valides au réveil avant de mettre en
ligne. Chaque entrée = ce qui a été fait, pourquoi, comment l'annuler. Build testé
avant chaque commit. **Rien touché au paiement (Flouci/licence/functions/api).**

Pour voir les changements : `git checkout nuit-23-06` puis `npm run dev` dans `app/`.
Pour tout annuler : rester sur `main` (la branche nuit n'affecte pas la prod).

---

## Nuit du 2026-06-23

### 1. Accessibilité — onglet actif ✅
**Constat :** l'app est déjà bien accessible (CategoryBar en `role=tablist`,
LangToggle `aria-pressed`, images avec `alt`, paybox `aria-modal`, drapeau
`role=img`). Seul manque : les onglets principaux (Séries / Examen blanc / VIP /
Coach / Ma progression) ne signalaient pas la page active aux lecteurs d'écran.

**Fait :** ajout de `aria-current="page"` sur l'onglet actif (`App.jsx`). Attribut
additif, **aucun changement visuel**, build OK.
**Annuler :** `git revert` du commit, ou retirer les `aria-current` des boutons
`.tab` dans `App.jsx`.

### 2. Polish mobile — vérifié OK ✅ (aucune correction nécessaire)
Mesuré à 390px (puppeteer + Chrome) : **0 débordement horizontal**
(scrollWidth = clientWidth = 390). La barre de catégories déborde volontairement
(scroll horizontal interne). Layout sombre propre et lisible sur téléphone →
**rien à corriger**.

### 3. Micro-interactions ✅
**But :** retour visuel vivant, cohérent avec le thème sombre « conduite de nuit »
(zéro emoji conservé).

**Fait :** `styles.css` + une ligne dans `App.jsx` :
- Réponse : la **bonne** réponse fait un léger « pop », la **mauvaise** un « shake ».
- **Retour tactile** au clic (boutons, choix, onglets, puces catégorie).
- **Spinner** jaune (couleur marquage routier) pour le chargement de catégorie.
Respecte le `prefers-reduced-motion` déjà présent. Build OK, thème inchangé.
**Annuler :** `git revert` du commit, ou retirer le bloc « Micro-interactions » en
bas de `styles.css` + le `<span className="spinner">` dans `App.jsx`.
