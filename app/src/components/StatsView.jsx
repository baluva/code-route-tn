import { useStore, levelInfo, resetProgress } from '../lib/store.js';
import { permisLabel, EXAM_PASS, serieQuizId } from '../lib/helpers.js';

export default function StatsView({ groups, catId, catLabel }) {
  const s = useStore();
  const lvl = levelInfo(s.xp);
  const acc = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;

  // Séries de la catégorie courante (toutes sous-catégories confondues).
  const allSeries = groups.flatMap((g) => g.series.map((sr) => ({ ...sr, slug: g.slug, label: g.label })));
  const bestOf = (sr) => s.best[serieQuizId(catId, sr.slug, sr.num)];
  const seriesDone = allSeries.filter((sr) => bestOf(sr)).length;
  const perfect = allSeries.filter((sr) => { const b = bestOf(sr); return b && b.score === b.total; }).length;

  return (
    <section className="stats-view">
      <div className="big-stats">
        <div className="bstat">
          <span className="ring-num">{lvl.level}</span>
          <span className="lbl">Niveau — {permisLabel(lvl.level)}</span>
          <span className="xpbar big"><i style={{ width: `${lvl.pct}%` }} /></span>
          <span className="muted">{lvl.into}/{lvl.need} XP vers le niveau {lvl.level + 1}</span>
        </div>
        <div className="bstat-grid">
          <div className="bcell"><span className="big">{s.xp}</span><span className="lbl">XP total</span></div>
          <div className="bcell"><span className="big">{acc}%</span><span className="lbl">réussite</span></div>
          <div className="bcell"><span className="big">{s.answered}</span><span className="lbl">réponses</span></div>
          <div className="bcell"><span className="big">{s.streak}</span><span className="lbl">jours</span></div>
          <div className="bcell"><span className="big">{seriesDone}/{allSeries.length}</span><span className="lbl">séries faites</span></div>
          <div className="bcell"><span className="big">{perfect}</span><span className="lbl">sans faute</span></div>
          <div className="bcell"><span className="big">{s.examPassed}</span><span className="lbl">examens réussis</span></div>
          <div className="bcell"><span className="big">{s.wrongIds.length}</span><span className="lbl">erreurs à revoir</span></div>
        </div>
      </div>

      <h3 style={{ marginTop: 28 }}>Progression · {catLabel}</h3>
      <div className="serie-progress">
        {allSeries.map((sr) => {
          const b = bestOf(sr);
          const pct = b ? Math.round((b.score / b.total) * 100) : 0;
          const tone = !b ? '' : b.score === b.total ? 'green' : pct >= 80 ? 'amber' : 'red';
          return (
            <div className="sp-row" key={`${sr.slug}-${sr.num}`}>
              <span className="sp-name">{groups.length > 1 ? `${sr.label} · ` : ''}Série {sr.num}</span>
              <span className="sp-bar"><i className={tone} style={{ width: `${pct}%` }} /></span>
              <span className="sp-val">{b ? `${b.score}/${b.total}` : '—'}</span>
            </div>
          );
        })}
      </div>

      <div className="reset-row">
        <button className="btn ghost" onClick={() => {
          if (confirm('Réinitialiser toute ta progression sur cet appareil ?')) resetProgress();
        }}>Réinitialiser ma progression</button>
        <span className="muted">Seuil de réussite à l'examen : {EXAM_PASS}/30 · progression stockée sur cet appareil.</span>
      </div>
    </section>
  );
}
