// Icônes SVG sur mesure (style pictogramme de panneau), une par type de véhicule.
// Trait monochrome via currentColor → s'adapte à l'état actif/inactif du chip.
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

const PATHS = {
  moto: (
    <>
      <circle cx="5.5" cy="16" r="3" />
      <circle cx="18.5" cy="16" r="3" />
      <path d="M8.5 16l2.2-4.5h4.3" />
      <path d="M15 11.5l3.5 4.5" />
      <path d="M8 11.5h3.2l1 2" />
      <path d="M14 8.5h2.4l1 3" />
    </>
  ),
  car: (
    <>
      <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2" />
      <path d="M9 17h6" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  truck: (
    <>
      <path d="M5 17H3V6a1 1 0 0 1 1-1h9v12" />
      <path d="M13 8h4l4 4v5h-2" />
      <path d="M9 17h6" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  bus: (
    <>
      <path d="M4 17H2V6a1 1 0 0 1 1-1h13a4 4 0 0 1 4 4v8h-2" />
      <path d="M8 17h6" />
      <path d="M2 11h18" />
      <path d="M7 5v6M13 5v6" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="16" cy="17" r="2" />
    </>
  ),
  tractor: (
    <>
      <circle cx="7" cy="15" r="4" />
      <circle cx="19" cy="16.5" r="2.2" />
      <path d="M7 11V5h2l2.4 5" />
      <path d="M3.5 11H13.5" />
      <path d="M19 14.3V11a1.5 1.5 0 0 0-1.5-1.5H13" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M13 3v5h5" />
      <path d="M9 13h6M9 16.5h4" />
    </>
  ),
};

const TYPE = { A: 'moto', B: 'car', BE: 'car', C: 'truck', CE: 'truck', D: 'bus', DE: 'bus', G: 'tractor', txt: 'doc' };

export default function CatIcon({ id, className = 'catchip-ic' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" {...P} aria-hidden focusable="false">
      {PATHS[TYPE[id] || 'car']}
    </svg>
  );
}
