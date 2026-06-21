import { useStore } from '../lib/store.js';
import { shuffle, EXAM_SIZE, EXAM_PASS, examQuizId } from '../lib/helpers.js';

export default function ExamView({ catId, catLabel, lang = 'ar', examPool, onPlay }) {
  const s = useStore();
  const id = examQuizId(catId, lang);
  const best = s.best[id];
  const size = Math.min(EXAM_SIZE, examPool.length);

  function start() {
    const questions = shuffle(examPool).slice(0, size);
    onPlay({
      id,
      title: `Examen blanc · ${catLabel}`,
      subtitle: `${size} questions · ${EXAM_PASS}/${EXAM_SIZE} pour réussir`,
      mode: 'examen',
      questions,
      timeLimit: 20 * 60,
    });
  }

  return (
    <section className="exam-hero">
      <div className="exam-card">
        <span className="badge badge-blue">ÉPREUVE THÉORIQUE · {catLabel}</span>
        <h2>Examen blanc</h2>
        <p className="muted">
          {size} questions tirées au hasard parmi les {examPool.length} de la catégorie,
          chronomètre de 20 minutes, <b>pas de correction</b> avant la fin — comme le jour J à l'ATTT.
          Il faut <b>{EXAM_PASS}/{EXAM_SIZE}</b> pour décrocher le code.
        </p>
        <div className="exam-meta">
          <div><span className="big">{size}</span><span className="lbl">questions</span></div>
          <div><span className="big">20:00</span><span className="lbl">chrono</span></div>
          <div><span className="big">{EXAM_PASS}</span><span className="lbl">pour réussir</span></div>
          <div><span className="big">{s.examPassed}</span><span className="lbl">réussis</span></div>
        </div>
        {best && (
          <p className={`verdict ${best.score >= EXAM_PASS ? 'ok' : 'no'}`} style={{ marginTop: 0 }}>
            Dernier record : {best.score}/{best.total} {best.score >= EXAM_PASS ? '— réussi' : '— continue !'}
          </p>
        )}
        <button className="btn primary full big-btn" onClick={start} disabled={!examPool.length}>
          Démarrer l'examen blanc
        </button>
      </div>
    </section>
  );
}
