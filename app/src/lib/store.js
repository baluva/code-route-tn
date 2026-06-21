// Progression locale : XP, niveau, série de jours, meilleurs scores par série/examen.
// 100 % localStorage — pas de compte, pas de serveur. Ta progression reste sur cet appareil.
import { useSyncExternalStore } from 'react';

const KEY = 'coderoutetn:v1';
const DEFAULT = {
  xp: 0,
  answered: 0,
  correct: 0,
  streak: 0,
  lastDay: null,
  best: {},        // { [id]: { score, total } }  id = "serie-3" ou "examen"
  examPassed: 0,   // nombre d'examens blancs réussis (≥ seuil)
  wrongIds: [],    // questions ratées (clé "s-q") → mode révision des erreurs
  vip: false,      // pass VIP débloqué (examens premium)
};

function read() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...DEFAULT }; }
}

let state = read();
const listeners = new Set();

function commit(next) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}

export function subscribe(l) { listeners.add(l); return () => listeners.delete(l); }
export function getState() { return state; }
export function useStore() { return useSyncExternalStore(subscribe, getState); }

// Niveaux : « permis » qui montent par paliers croissants (×1.4).
// 1 Apprenti · 2 Conduite accompagnée · 3 Permis B … (libellés gérés à l'affichage)
export function levelInfo(xp) {
  let level = 1, need = 120, floor = 0;
  while (xp >= floor + need) { floor += need; level++; need = Math.round(need * 1.4); }
  return { level, into: xp - floor, need, pct: Math.round(((xp - floor) / need) * 100) };
}

const today = () => new Date().toISOString().slice(0, 10);

// Enregistre une réponse (mode révision, correction immédiate).
export function recordAnswer(correct, qid) {
  const s = { ...state, answered: state.answered + 1 };
  if (correct) {
    s.correct += 1;
    s.xp += 10;
    if (qid) s.wrongIds = state.wrongIds.filter((x) => x !== qid); // résolue → retirée des erreurs
  } else if (qid && !state.wrongIds.includes(qid)) {
    s.wrongIds = [...state.wrongIds, qid];
  }
  const d = today();
  if (s.lastDay !== d) {
    const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    s.streak = s.lastDay === yest ? s.streak + 1 : 1;
    s.lastDay = d;
  }
  commit(s);
}

// Fin d'un quiz/examen : mémorise le meilleur score + bonus.
export function recordQuiz(id, score, total, passed = false) {
  const best = { ...state.best };
  const prev = best[id];
  let bonusXp = 0;
  if (prev === undefined) bonusXp = 40;            // première complétion
  if (prev === undefined || score > prev.score) best[id] = { score, total };
  const examPassed = state.examPassed + (passed ? 1 : 0);
  commit({ ...state, best, examPassed, xp: state.xp + bonusXp });
}

export function unlockVip() { commit({ ...state, vip: true }); }

export function resetProgress() { commit({ ...DEFAULT, vip: state.vip }); }
