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
