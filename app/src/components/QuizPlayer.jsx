import { useEffect, useRef, useState } from 'react';
import { recordAnswer, recordQuiz } from '../lib/store.js';
import { qid, EXAM_PASS } from '../lib/helpers.js';

const KEYS = ['A', 'B', 'C', 'D'];          // libellés mode texte
const AR_KEYS = ['أ', 'ب', 'ج'];            // libellés mode image (codedelaroute)
const AR_TONE = ['c-red', 'c-yellow', 'c-green'];
const IMG_BASE = import.meta.env.BASE_URL + 'images/';   // visuels du dataset texte (locaux)

function fmt(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
const isImg = (q) => q.kind === 'image';
const keyLabel = (q, idx) => (isImg(q) ? AR_KEYS[idx] : KEYS[idx]);
const nOptions = (q) => (isImg(q) ? (q.nOptions || 3) : q.options.length);

export default function QuizPlayer({ quiz, onExit }) {
  // quiz = { id, title, subtitle, mode:'revision'|'examen', questions:[…], timeLimit? }
  const exam = quiz.mode === 'examen';
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});   // { [index]: pickedOptionIndex }
  const [done, setDone] = useState(false);
  const [left, setLeft] = useState(quiz.timeLimit || 0);
  const recorded = useRef(false);

  const questions = quiz.questions;
  const total = questions.length;
  const cur = questions[i];
  const picked = answers[i] ?? null;

  const score = questions.reduce(
    (n, q, idx) => n + (answers[idx] === q.correctIndex ? 1 : 0), 0
  );

  useEffect(() => {
    if (!exam || !quiz.timeLimit || done) return;
    if (left <= 0) { finish(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [exam, left, done]);

  function choose(idx) {
    if (!exam && picked !== null) return;
    setAnswers((a) => ({ ...a, [i]: idx }));
    if (!exam) recordAnswer(idx === cur.correctIndex, qid(cur));
  }

  function finish() {
    if (recorded.current) return;
    recorded.current = true;
    const sc = questions.reduce((n, q, idx) => n + (answers[idx] === q.correctIndex ? 1 : 0), 0);
    if (exam) {
      questions.forEach((q, idx) => recordAnswer(answers[idx] === q.correctIndex, qid(q)));
      recordQuiz(quiz.id, sc, total, sc >= EXAM_PASS);
    } else {
      recordQuiz(quiz.id, sc, total);
    }
    setDone(true);
  }

  function next() {
    if (i + 1 >= total) finish();
    else setI(i + 1);
  }

  if (done) return <Result quiz={quiz} questions={questions} answers={answers} score={score} total={total} onExit={onExit}
    onRetry={() => { setI(0); setAnswers({}); setDone(false); setLeft(quiz.timeLimit || 0); recorded.current = false; }} />;

  const answeredCount = Object.keys(answers).length;
  const showCorrection = !exam && picked !== null;

  return (
    <div className="player">
      <div className="qhead">
        <button className="btn ghost icon" onClick={onExit} title="Quitter">←</button>
        <div className="qhead-mid">
          <b>{quiz.title}</b>
          <span className="sub">{quiz.subtitle}</span>
        </div>
        {exam && quiz.timeLimit
          ? <span className={`timer ${left < 60 ? 'low' : ''}`}>⏱ {fmt(left)}</span>
          : <span className="qcount">{i + 1}/{total}</span>}
      </div>

      <div className="lane"><i style={{ width: `${((exam ? answeredCount : i) / total) * 100}%` }} /></div>

      {cur.critical && <div className="crit-flag">Question éliminatoire</div>}

      {isImg(cur) ? (
        <>
          {/* photo de la scène */}
          <figure className="qscene">
            <img src={cur.img.scene} alt={`Scène ${i + 1}`} loading="eager"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
          </figure>
          {/* bandeau énoncé + options (image) ; remplacé par la réponse corrigée après le choix */}
          <figure className="qbandeau">
            <img src={showCorrection ? cur.img.answer : cur.img.question}
              alt={showCorrection ? 'Correction' : `Question ${i + 1}`} loading="eager" />
          </figure>
        </>
      ) : (
        <>
          {cur.hasImage && (
            <figure className="qfig">
              <img src={IMG_BASE + cur.image} alt={`Question ${i + 1}`} loading="eager"
                onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
            </figure>
          )}
          <div className="enonce" dir="rtl" lang="ar">{cur.question}</div>
        </>
      )}

      <div className={`choices ${isImg(cur) ? 'ar' : ''}`}>
        {Array.from({ length: nOptions(cur) }).map((_, idx) => {
          let cls = 'choice';
          if (isImg(cur)) cls += ' ' + AR_TONE[idx];
          if (picked !== null) {
            if (!exam && idx === cur.correctIndex) cls += ' correct';
            else if (!exam && idx === picked) cls += ' wrong';
            else if (exam && idx === picked) cls += ' picked';
          }
          return (
            <button key={idx} className={cls} disabled={!exam && picked !== null} onClick={() => choose(idx)}>
              <span className="key">{keyLabel(cur, idx)}</span>
              {!isImg(cur) && <span className="ar" dir="rtl" lang="ar">{cur.options[idx]}</span>}
            </button>
          );
        })}
      </div>

      {showCorrection && (
        <>
          <div className={`verdict ${picked === cur.correctIndex ? 'ok' : 'no'}`}>
            {picked === cur.correctIndex
              ? 'Bonne réponse'
              : <>Mauvaise réponse — la bonne est <b>{keyLabel(cur, cur.correctIndex)}</b></>}
          </div>
          <button className="btn primary full" onClick={next}>
            {i + 1 >= total ? 'Voir le résultat' : 'Question suivante →'}
          </button>
        </>
      )}

      {exam && (
        <div className="exam-nav">
          <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Précédente</button>
          {i + 1 >= total
            ? <button className="btn primary" onClick={finish}>Terminer l'examen</button>
            : <button className="btn primary" onClick={() => setI(i + 1)}>Suivante →</button>}
        </div>
      )}
    </div>
  );
}

function Result({ quiz, questions, answers, score, total, onExit, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const exam = quiz.mode === 'examen';
  const passed = exam && score >= EXAM_PASS;
  const wrong = questions
    .map((q, idx) => ({ q, idx, picked: answers[idx] }))
    .filter((x) => x.picked !== x.q.correctIndex);

  return (
    <div className="player">
      <div className="result">
        <div className="score">{score}<span>/{total}</span></div>
        {exam
          ? <p className={`verdict-big ${passed ? 'ok' : 'no'}`}>{passed ? 'Examen réussi !' : `Recalé — il faut ${EXAM_PASS}/${total}`}</p>
          : <p className="muted">{pct}% de bonnes réponses · +{score * 10} XP</p>}
        <div className="btnrow center">
          <button className="btn primary" onClick={onRetry}>↻ Recommencer</button>
          <button className="btn ghost" onClick={onExit}>← Retour</button>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="review">
          <h3>À revoir ({wrong.length})</h3>
          {wrong.map(({ q, idx, picked }) => (
            <div className="review-item" key={idx}>
              {isImg(q)
                ? <img src={q.img.answer} alt="" loading="lazy" />
                : (q.hasImage && <img src={IMG_BASE + q.image} alt="" />)}
              <div>
                {isImg(q) ? (
                  <p className="ar"><b>Série {q.serie} · Q{q.q}</b> — bonne réponse&nbsp;: <b>{AR_KEYS[q.correctIndex]}</b>
                    {picked != null ? <> (ta réponse&nbsp;: {AR_KEYS[picked] ?? '—'})</> : ' (sans réponse)'}</p>
                ) : (
                  <>
                    <p className="ar" dir="rtl" lang="ar"><b>{q.question}</b></p>
                    <p className="ar wrong-txt" dir="rtl" lang="ar">
                      {picked != null ? `✗ ${q.options[picked]}` : '✗ sans réponse'}
                    </p>
                    <p className="ar ok-txt" dir="rtl" lang="ar">✓ {q.options[q.correctIndex]}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
