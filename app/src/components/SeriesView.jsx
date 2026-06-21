import { useStore } from '../lib/store.js';
import { qid, serieQuizId } from '../lib/helpers.js';

export default function SeriesView({ groups, catId, allQuestions, onPlay }) {
  const s = useStore();

  // Révision des erreurs — limitée aux questions de la catégorie courante.
  const wrongSet = new Set(s.wrongIds);
  const wrongQuestions = allQuestions.filter((q) => wrongSet.has(qid(q)));

  return (
    <div className="series-wrap">
      {wrongQuestions.length > 0 && (
        <div className="grid">
          <article className="card card-wrong">
            <div className="card-top">
              <div>
                <div className="matiere">À réviser</div>
                <span className="route-num">{wrongQuestions.length}</span>
              </div>
              <span className="badge badge-red">Erreurs</span>
            </div>
            <div className="sub">Rejoue uniquement les questions ratées de cette catégorie.</div>
            <div className="btnrow">
              <button className="btn primary full" onClick={() => onPlay({
                id: `${catId}:erreurs`, title: 'Révision des erreurs',
                subtitle: `${wrongQuestions.length} questions ratées`,
                mode: 'revision', questions: wrongQuestions,
              })}>Réviser mes erreurs →</button>
            </div>
          </article>
        </div>
      )}

      {groups.map((g) => (
        <section className="subsection" key={g.slug}>
          {groups.length > 1 && (
            <div className="subhead">
              <h3>{g.label}</h3>
              <span className={`badge ${g.type === 'examen' ? 'badge-blue' : 'badge-amber'}`}>
                {g.type === 'examen' ? 'Examen' : 'Exercices'}
              </span>
              <span className="subhead-n">{g.series.length} séries</span>
            </div>
          )}
          <div className="grid">
            {g.series.map((serie, n) => {
              const id = serieQuizId(catId, g.slug, serie.num);
              const best = s.best[id];
              return (
                <article className="card" key={serie.num} style={{ animationDelay: `${n * 20}ms` }}>
                  <div className="card-top">
                    <div>
                      <div className="matiere">Série</div>
                      <span className="route-num"><span className="hash">N°</span>{serie.num}</span>
                    </div>
                    {best && <span className={`badge ${best.score === best.total ? 'badge-green' : 'badge-amber'}`}>{best.score}/{best.total}</span>}
                  </div>
                  <div className="sub">{serie.questions.length} questions · {g.label}</div>
                  <div className="dots">
                    {best ? <>Meilleur score&nbsp;: <b>{best.score}/{best.total}</b></> : 'Pas encore tentée'}
                  </div>
                  <div className="btnrow">
                    <button className="btn primary full" onClick={() => onPlay({
                      id, title: `Série ${serie.num}`, subtitle: `${g.label} · correction immédiate`,
                      mode: 'revision', questions: serie.questions,
                    })}>{best ? 'Refaire' : 'Commencer'} →</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
