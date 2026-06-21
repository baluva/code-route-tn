// Utilitaires partagés.

// Regroupe les questions à plat par numéro de série (une seule sous-catégorie).
export function groupBySerie(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.serie)) map.set(r.serie, []);
    map.get(r.serie).push(r);
  }
  return [...map.entries()]
    .map(([num, questions]) => ({
      num,
      questions: questions.sort((a, b) => a.q - b.q),
    }))
    .sort((a, b) => a.num - b.num);
}

// Regroupe par SOUS-CATÉGORIE puis par série (datasets codedelaroute multi-types).
// Renvoie [{ slug, label, type, series:[{num, questions:[…]}] }] dans l'ordre des subcats.
export function groupBySubcat(rows, subcatsOrder = []) {
  const subs = new Map();
  for (const r of rows) {
    const slug = r.subSlug || 'txt';
    if (!subs.has(slug)) {
      subs.set(slug, {
        slug,
        label: r.subLabel || 'Séries',
        type: r.subType || 'serie',
        _bySerie: new Map(),
      });
    }
    const g = subs.get(slug)._bySerie;
    if (!g.has(r.serie)) g.set(r.serie, []);
    g.get(r.serie).push(r);
  }
  const order = subcatsOrder.length
    ? subcatsOrder
    : [...subs.keys()];
  return order
    .filter((slug) => subs.has(slug))
    .map((slug) => {
      const s = subs.get(slug);
      const series = [...s._bySerie.entries()]
        .map(([num, questions]) => ({ num, questions: questions.sort((a, b) => a.q - b.q) }))
        .sort((a, b) => a.num - b.num);
      return { slug: s.slug, label: s.label, type: s.type, series };
    });
}

// Mélange (Fisher–Yates) — copie, ne mute pas l'entrée.
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Clé unique d'une question (suivi des erreurs), namespacée par catégorie + sous-catégorie.
export const qid = (r) => `${r.cat || 'txt'}:${r.subSlug || 'txt'}:${r.serie}-${r.q}`;

// Identifiant d'un quiz « série » pour mémoriser le meilleur score (par catégorie).
export const serieQuizId = (catId, slug, num) => `${catId}:${slug}:serie-${num}`;
// Identifiant de l'examen blanc d'une catégorie (par langue).
export const examQuizId = (catId, lang = 'ar') => `${catId}:${lang}:examen`;

// Paliers « permis » selon le niveau.
const PERMIS = [
  'Piéton',          // 1
  'Apprenti',        // 2
  'Conduite accomp.',// 3
  'Code en poche',   // 4
  'Permis B',        // 5
  'Conducteur sûr',  // 6
  'Moniteur',        // 7
];
export const permisLabel = (level) => PERMIS[Math.min(level, PERMIS.length) - 1] || 'Pilote';

export const EXAM_SIZE = 30;     // questions par examen blanc (format ATTT)
export const EXAM_PASS = 24;     // seuil de réussite (24/30)
