import { useStore, levelInfo } from '../lib/store.js';
import { permisLabel } from '../lib/helpers.js';

// Drapeau tunisien (SVG) — emblème de la marque.
export function FlagTN({ className = 'flag-tn' }) {
  return (
    <svg className={className} viewBox="0 0 90 60" role="img" aria-label="Drapeau tunisien">
      <rect width="90" height="60" rx="6" fill="#E70013" />
      <circle cx="45" cy="30" r="15" fill="#fff" />
      <circle cx="45" cy="30" r="10" fill="#E70013" />
      <circle cx="48.5" cy="30" r="8.2" fill="#fff" />
      <path fill="#E70013" d="M52.5 24 L53.9 28.1 L58.2 28.2 L54.8 30.7 L56 34.9 L52.5 32.4 L49 34.9 L50.2 30.7 L46.8 28.2 L51.1 28.1 Z" />
    </svg>
  );
}

export default function TopBar() {
  const s = useStore();
  const lvl = levelInfo(s.xp);
  const acc = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-flag" aria-hidden><FlagTN /></span>
          <span>CODE<span className="tn">ROUTE</span><small>permis tunisien · ATTT</small></span>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="big">{lvl.level}</span>
            <span>
              <span className="lbl">Niveau · {permisLabel(lvl.level)}</span>
              <span className="xpbar"><i style={{ width: `${lvl.pct}%` }} /></span>
            </span>
          </div>
          <div className="stat">
            <span className="big">{s.xp}</span>
            <span className="lbl">XP</span>
          </div>
          <div className="stat">
            <span className="big">{acc}%</span>
            <span className="lbl">{s.answered} réponses</span>
          </div>
          <div className="stat">
            <span className="big">{s.streak}</span>
            <span className="lbl">jours d'affilée</span>
          </div>
        </div>
      </div>
    </header>
  );
}
