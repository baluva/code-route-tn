import { useEffect, useMemo, useState } from 'react';
import TopBar from './components/TopBar.jsx';
import CategoryBar from './components/CategoryBar.jsx';
import LangToggle from './components/LangToggle.jsx';
import SeriesView from './components/SeriesView.jsx';
import ExamView from './components/ExamView.jsx';
import VipView from './components/VipView.jsx';
import Testimonials from './components/Testimonials.jsx';
import StatsView from './components/StatsView.jsx';
import QuizPlayer from './components/QuizPlayer.jsx';
import CoachView from './components/CoachView.jsx';
import { groupBySubcat } from './lib/helpers.js';
import { dataFetch } from './lib/api.js';
import { setCoachLicense, setCoachActive, getState } from './lib/store.js';

const TABS = ['series', 'examen', 'vip', 'coach', 'stats'];
// Chaque onglet est une VRAIE URL indexable (plus de #ancre).
const TAB_PATH = { series: '/', examen: '/examen-blanc', vip: '/examens-vip', coach: '/coach', stats: '/progression' };
const PATH_TAB = { '/': 'series', '/examen-blanc': 'examen', '/examens-vip': 'vip', '/coach': 'coach', '/progression': 'stats' };
const SITE = 'https://code-route-tn.pages.dev';

// Onglet correspondant à l'URL courante (+ migration des anciens liens #ancre).
function tabFromLocation() {
  const h = location.hash.replace('#', '');
  if (TABS.includes(h)) return h;
  const p = location.pathname.replace(/\/+$/, '') || '/';
  return PATH_TAB[p] || 'series';
}

// --- SEO par page : titre + description + canonical propres à chaque URL.
function setMetaTag(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function setCanonical(url) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
  el.setAttribute('href', url);
}
function seoFor(tab) {
  switch (tab) {
    case 'examen':
      return {
        title: 'Examen blanc du code de la route tunisien (chronométré, façon ATTT) | Code Route TN',
        desc: "Passe un examen blanc du code de la route tunisien en conditions réelles : chronométré façon ATTT, correction immédiate, toutes catégories, en français et en arabe.",
      };
    case 'vip':
      return {
        title: 'Examens VIP & questions éliminatoires du code tunisien | Code Route TN',
        desc: "Entraîne-toi sur les examens VIP du code de la route tunisien : séries spéciales et questions éliminatoires pour ne rien laisser au hasard le jour de l'examen.",
      };
    case 'coach':
      return {
        title: 'Coach code de la route — révision guidée pour réussir le code tunisien | Code Route TN',
        desc: "Le mode Coach cible tes points faibles et te fait réviser intelligemment pour décrocher le code de la route tunisien plus vite.",
      };
    case 'stats':
      return {
        title: 'Ma progression au code de la route tunisien — scores & réussite | Code Route TN',
        desc: "Suis ta progression à l'épreuve théorique du code tunisien : scores, taux de réussite par série et historique d'entraînement.",
      };
    default: // series (accueil)
      return {
        title: 'Code de la Route Tunisie — Test du code (toutes catégories, FR/AR) | Code Route TN',
        desc: "Révise gratuitement le code de la route tunisien : moto, voiture, poids lourd, bus et remorque. Examen blanc chronométré façon ATTT, plus de 11 000 questions en français et en arabe, correction immédiate.",
      };
  }
}
function applyHead(tab) {
  const { title, desc } = seoFor(tab);
  const url = SITE + TAB_PATH[tab];
  document.title = title;
  setMetaTag('name', 'description', desc);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', desc);
  setMetaTag('property', 'og:url', url);
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', desc);
  setCanonical(url);
}

// Catégorie « historique » : fiches texte voiture (elpermis) — datamodel différent (texte+options).
const LEGACY = {
  id: 'txt', icon: '', label: 'Voiture · fiches (texte)',
  kind: 'text', data: 'data/questions.json', langs: ['ar'], subcatsByLang: {},
};
const CAT_KEY = 'coderoutetn:cat';
const LANG_KEY = 'coderoutetn:lang';

export default function App() {
  const [tab, setTabState] = useState(tabFromLocation);
  const setTab = (t) => {
    setTabState(t);
    const path = TAB_PATH[t];
    if (location.pathname !== path || location.hash) history.pushState({ tab: t }, '', path);
  };

  const [catalog, setCatalog] = useState(null);     // liste des catégories
  const [catId, setCatId] = useState(() => localStorage.getItem(CAT_KEY) || 'A');
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'ar'); // langue des questions
  const [rows, setRows] = useState(null);           // questions de la catégorie courante
  const [loadingCat, setLoadingCat] = useState(true);
  const [err, setErr] = useState(null);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    // Migration : un ancien lien en #onglet devient une URL propre (/onglet),
    // en conservant les paramètres (?coach=… du retour de paiement).
    if (location.hash) {
      const h = location.hash.replace('#', '');
      history.replaceState(null, '', (TABS.includes(h) ? TAB_PATH[h] : location.pathname) + location.search);
    }
    const onPop = () => setTabState(tabFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Met à jour titre/description/canonical à chaque changement de page.
  useEffect(() => { applyHead(tab); }, [tab]);

  // Retour de paiement Flouci (?coach=licence) + (re)vérification serveur du Pass Coach.
  // Anti-triche : on n'active le Coach que si le serveur confirme la licence signée.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromPay = params.get('coach');
    if (fromPay) {
      setCoachLicense(fromPay);
      params.delete('coach'); params.delete('pay');
      const q = params.toString();
      history.replaceState(null, '', location.pathname + (q ? `?${q}` : '') + location.hash);
    }
    const token = fromPay || getState().coachLicense;
    if (!token) { setCoachActive(false); return; }
    fetch(import.meta.env.BASE_URL + 'api/entitlement?token=' + encodeURIComponent(token))
      .then((r) => r.json())
      .then((d) => setCoachActive(!!d.valid))
      .catch(() => { /* hors-ligne : on garde l'état actuel */ });
  }, []);

  // Catalogue des catégories (image, depuis R2) + la catégorie texte historique.
  useEffect(() => {
    dataFetch('data/crt/index.json')
      .then((r) => r.json())
      .then((idx) => setCatalog([...idx.categories, LEGACY]))
      .catch(() => setCatalog([LEGACY]));   // au pire, juste les fiches texte
  }, []);

  const cat = useMemo(
    () => (catalog ? catalog.find((c) => c.id === catId) || catalog[0] : null),
    [catalog, catId]
  );

  // Charge les questions de la catégorie sélectionnée.
  useEffect(() => {
    if (!cat) return;
    setLoadingCat(true); setRows(null); setErr(null);
    const kind = cat.kind || 'image';
    dataFetch(cat.data)
      .then((r) => r.json())
      .then((data) => { setRows(data.map((q) => ({ ...q, kind }))); })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoadingCat(false));
  }, [cat]);

  function pickCat(id) {
    setCatId(id);
    localStorage.setItem(CAT_KEY, id);
    setQuiz(null);
  }
  function pickLang(l) {
    setLang(l);
    localStorage.setItem(LANG_KEY, l);
    setQuiz(null);
  }

  const isImageCat = !!cat && cat.id !== 'txt';
  const catLangs = cat?.langs || ['ar'];
  const effLang = catLangs.includes(lang) ? lang : catLangs[0];   // fallback si langue absente
  const langFallback = isImageCat && !catLangs.includes(lang);

  // Questions de la langue effective (les fiches texte ne se filtrent pas).
  const visibleRows = useMemo(() => {
    if (!rows) return null;
    return isImageCat ? rows.filter((q) => q.lang === effLang) : rows;
  }, [rows, effLang, isImageCat]);

  const subOrder = (cat?.subcatsByLang?.[effLang] || []).map((s) => s.slug);
  const groups = useMemo(() => (visibleRows ? groupBySubcat(visibleRows, subOrder) : []), [visibleRows, effLang, cat]);
  const seriesCount = groups.reduce((n, g) => n + g.series.length, 0);
  // Bassin pour l'examen blanc : les questions de type « examen », sinon tout.
  const examPool = useMemo(() => {
    if (!visibleRows) return [];
    const ex = visibleRows.filter((q) => q.subType === 'examen');
    return ex.length ? ex : visibleRows;
  }, [visibleRows]);
  // Bassin « éliminatoires » pour l'examen VIP spécial.
  const criticalPool = useMemo(() => (visibleRows ? visibleRows.filter((q) => q.critical) : []), [visibleRows]);

  function play(q) { setQuiz(q); window.scrollTo({ top: 0 }); }
  function exit() { setQuiz(null); }

  if (quiz) {
    return (
      <>
        <TopBar />
        <div className="wrap"><QuizPlayer quiz={quiz} onExit={exit} /></div>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="wrap">
        <section className="hero">
          <div className="hero-text">
            <span className="eyebrow">Épreuve théorique · Tunisie · toutes catégories</span>
            <h1>Garde les yeux sur la route,<br /><span className="tn">décroche ton code.</span></h1>
            <p>
              Entraîne-toi sur les vraies séries de l'épreuve théorique — moto, voiture, poids lourd,
              bus, remorque… Correction immédiate, examen blanc chronométré et progression sauvegardée.
            </p>
            <div className="roadmark" aria-hidden />
            <div className="hero-points">
              {cat && <span>{cat.label}</span>}
              {visibleRows && <span>{seriesCount} séries</span>}
              {visibleRows && <span>{visibleRows.length} questions</span>}
              <span>{effLang === 'fr' ? 'en français' : 'بالعربية'}</span>
            </div>
          </div>
          <figure className="hero-photo">
            <img src={import.meta.env.BASE_URL + 'images/people/hero.jpg'} alt="Au volant, au coucher du soleil" loading="eager" />
          </figure>
        </section>

        <CategoryBar catalog={catalog} catId={cat?.id} onPick={pickCat} lang={lang} />
        {isImageCat && (
          <div className="lang-row">
            <LangToggle lang={lang} onPick={pickLang} available={catLangs} />
            {langFallback && (
              <span className="lang-note">Pas de version française pour cette catégorie — affichage en arabe.</span>
            )}
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${tab === 'series' ? 'active' : ''}`} aria-current={tab === 'series' ? 'page' : undefined} onClick={() => setTab('series')}>
            Séries{rows ? ` · ${seriesCount}` : ''}
          </button>
          <button className={`tab ${tab === 'examen' ? 'active' : ''}`} aria-current={tab === 'examen' ? 'page' : undefined} onClick={() => setTab('examen')}>
            Examen blanc
          </button>
          <button className={`tab tab-vip ${tab === 'vip' ? 'active' : ''}`} aria-current={tab === 'vip' ? 'page' : undefined} onClick={() => setTab('vip')}>
            ★ Examens VIP
          </button>
          <button className={`tab tab-coach ${tab === 'coach' ? 'active' : ''}`} aria-current={tab === 'coach' ? 'page' : undefined} onClick={() => setTab('coach')}>
            Coach
          </button>
          <button className={`tab ${tab === 'stats' ? 'active' : ''}`} aria-current={tab === 'stats' ? 'page' : undefined} onClick={() => setTab('stats')}>
            Ma progression
          </button>
        </div>

        {err && <div className="empty">Erreur de chargement des données : {err}</div>}
        {!err && (loadingCat || !visibleRows) && <div className="empty">Chargement de la catégorie {cat?.label}…</div>}

        {!err && visibleRows && (
          <>
            {tab === 'series' && <SeriesView groups={groups} catId={cat.id} lang={effLang} allQuestions={visibleRows} onPlay={play} />}
            {tab === 'examen' && <ExamView catId={cat.id} catLabel={cat.label} lang={effLang} examPool={examPool} onPlay={play} />}
            {tab === 'vip' && <VipView catId={cat.id} catLabel={cat.label} lang={effLang} examPool={examPool} criticalPool={criticalPool} onPlay={play} />}
            {tab === 'coach' && <CoachView catId={cat.id} catLabel={cat.label} allQuestions={visibleRows} onPlay={play} />}
            {tab === 'stats' && <StatsView groups={groups} catId={cat.id} catLabel={cat.label} />}
            {tab === 'series' && <Testimonials />}
          </>
        )}

        <div className="footer">
          <span className="credit">Code Route TN</span> — entraînement au code de la route tunisien,
          toutes catégories. Progression stockée sur cet appareil.<br />
          Conçu par <a href="https://github.com/baluva" target="_blank" rel="noopener">Louey Barbirou</a> ·{' '}
          <a href="https://github.com/baluva/code-route-tn" target="_blank" rel="noopener">Code source sur GitHub</a>
        </div>
      </div>
    </>
  );
}
