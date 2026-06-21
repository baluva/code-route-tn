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
import { groupBySubcat } from './lib/helpers.js';

const TABS = ['series', 'examen', 'vip', 'stats'];
const hashTab = () => { const h = location.hash.replace('#', ''); return TABS.includes(h) ? h : 'series'; };

// Catégorie « historique » : fiches texte voiture (elpermis) — datamodel différent (texte+options).
const LEGACY = {
  id: 'txt', icon: '', label: 'Voiture · fiches (texte)',
  kind: 'text', data: 'data/questions.json', langs: ['ar'], subcatsByLang: {},
};
const CAT_KEY = 'coderoutetn:cat';
const LANG_KEY = 'coderoutetn:lang';

export default function App() {
  const [tab, setTabState] = useState(hashTab);
  const setTab = (t) => { setTabState(t); history.replaceState(null, '', `#${t}`); };

  const [catalog, setCatalog] = useState(null);     // liste des catégories
  const [catId, setCatId] = useState(() => localStorage.getItem(CAT_KEY) || 'A');
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'ar'); // langue des questions
  const [rows, setRows] = useState(null);           // questions de la catégorie courante
  const [loadingCat, setLoadingCat] = useState(true);
  const [err, setErr] = useState(null);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const onHash = () => setTabState(hashTab());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Catalogue des catégories (image, depuis R2) + la catégorie texte historique.
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/crt/index.json')
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
    fetch(import.meta.env.BASE_URL + cat.data)
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

        <CategoryBar catalog={catalog} catId={cat?.id} onPick={pickCat} />
        {isImageCat && (
          <div className="lang-row">
            <LangToggle lang={lang} onPick={pickLang} available={catLangs} />
            {langFallback && (
              <span className="lang-note">Pas de version française pour cette catégorie — affichage en arabe.</span>
            )}
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${tab === 'series' ? 'active' : ''}`} onClick={() => setTab('series')}>
            Séries{rows ? ` · ${seriesCount}` : ''}
          </button>
          <button className={`tab ${tab === 'examen' ? 'active' : ''}`} onClick={() => setTab('examen')}>
            Examen blanc
          </button>
          <button className={`tab tab-vip ${tab === 'vip' ? 'active' : ''}`} onClick={() => setTab('vip')}>
            ★ Examens VIP
          </button>
          <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
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
