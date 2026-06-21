import { useState } from 'react';
import { useStore, unlockVip } from '../lib/store.js';
import { shuffle } from '../lib/helpers.js';

const PRICE = '5 DT';
const VIP_EXAMS = [
  { key: 'royal', title: 'Examen Royal', desc: '40 questions premium, chrono 25 min — le grand format.', size: 40, time: 25 * 60, pool: 'exam' },
  { key: 'elim', title: 'Spécial éliminatoires', desc: 'Uniquement les questions qui recalent le jour J.', size: 30, time: 20 * 60, pool: 'crit' },
  { key: 'marathon', title: 'Marathon', desc: '60 questions d’affilée — teste ton endurance.', size: 60, time: 45 * 60, pool: 'exam' },
];

const FEATURES = [
  'Examens VIP : Royal, Marathon & Spécial éliminatoires',
  'Tirages plus longs et chronos réalistes',
  'Toutes les catégories et les deux langues',
  'Sans publicité, paiement unique',
];
const PAYMENTS = [
  { name: 'Flouci' }, { name: 'D17' },
  { name: 'e-DINAR (La Poste)' }, { name: 'Espèces (auto-école)' },
];

export default function VipView({ catId, catLabel, lang = 'ar', examPool, criticalPool, onPlay }) {
  const s = useStore();
  const [showPay, setShowPay] = useState(false);

  function startVip(cfg) {
    if (!s.vip) { setShowPay(true); return; }
    const base = cfg.pool === 'crit' ? criticalPool : examPool;
    if (!base.length) return;
    const size = Math.min(cfg.size, base.length);
    onPlay({
      id: `vip:${catId}:${lang}:${cfg.key}`,
      title: `${cfg.title} · ${catLabel}`,
      subtitle: `VIP · ${size} questions`,
      mode: 'examen', questions: shuffle(base).slice(0, size), timeLimit: cfg.time,
    });
  }

  return (
    <section className="vip">
      {s.vip ? (
        <div className="vip-active">
          <span className="vip-badge">★ PASS VIP</span>
          <b>Pass VIP actif</b> — tous les examens premium sont débloqués. Bonne route !
        </div>
      ) : (
        <div className="vip-pitch">
          <div className="vip-pitch-txt">
            <span className="vip-badge">★ PASS VIP</span>
            <h2>Passe en mode <span className="gold">VIP</span></h2>
            <p>Débloque les examens premium et mets toutes les chances de ton côté pour décrocher le code.</p>
            <ul className="vip-feats">
              {FEATURES.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
          </div>
          <div className="vip-price-card">
            <span className="vip-price-lbl">Paiement unique</span>
            <div className="vip-price">{PRICE}</div>
            <span className="vip-price-sub">accès à vie · sur cet appareil</span>
            <button className="btn primary full big-btn" onClick={() => setShowPay(true)}>Débloquer le pass VIP</button>
          </div>
        </div>
      )}

      <div className="grid vip-grid">
        {VIP_EXAMS.map((cfg, n) => (
          <article className={`card vip-card ${s.vip ? '' : 'locked'}`} key={cfg.key} style={{ animationDelay: `${n * 26}ms` }}>
            <div className="card-top">
              <div>
                <div className="matiere">Examen VIP</div>
                <span className="route-num" style={{ fontSize: 30 }}>{cfg.title}</span>
              </div>
              <span className="badge badge-amber">{s.vip ? 'VIP' : '5 DT'}</span>
            </div>
            <div className="sub">{cfg.desc}</div>
            <div className="btnrow">
              <button className="btn primary full" onClick={() => startVip(cfg)}>
                {s.vip ? 'Démarrer →' : 'Débloquer pour 5 DT'}
              </button>
            </div>
          </article>
        ))}
      </div>

      {showPay && (
        <div className="modal-back" onClick={(e) => { if (e.target.classList.contains('modal-back')) setShowPay(false); }}>
          <div className="paybox" role="dialog" aria-modal="true" aria-label="Débloquer le pass VIP">
            <button className="paybox-x" onClick={() => setShowPay(false)} aria-label="Fermer">×</button>
            <span className="vip-badge">★ PASS VIP</span>
            <h3>Débloque tout pour <span className="gold">{PRICE}</span></h3>
            <ul className="vip-feats">{FEATURES.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <div className="pay-methods">
              {PAYMENTS.map((p) => <span key={p.name} className="pay-chip">{p.name}</span>)}
            </div>
            <button className="btn primary full big-btn" onClick={() => { unlockVip(); setShowPay(false); }}>
              J’ai payé — débloquer
            </button>
            <p className="pay-note">Démo portfolio : le paiement n’est pas réellement débité. En production, brancher Flouci / D17 / e-DINAR.</p>
          </div>
        </div>
      )}
    </section>
  );
}
