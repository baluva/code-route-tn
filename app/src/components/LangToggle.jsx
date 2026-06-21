// Bascule de langue des questions : Français (examen/Exercices) ⇄ Arabe (إمتحان/تمارين).
export default function LangToggle({ lang, onPick, available }) {
  // available = liste des langues dispo pour la catégorie courante (ex. ['fr','ar'] ou ['ar'])
  const opts = [
    { id: 'fr', label: 'Français' },
    { id: 'ar', label: 'العربية' },
  ];
  return (
    <div className="langtoggle" role="group" aria-label="Langue des questions">
      {opts.map((o) => {
        const dispo = available.includes(o.id);
        return (
          <button
            key={o.id}
            className={`langbtn ${lang === o.id ? 'active' : ''}`}
            aria-pressed={lang === o.id}
            title={dispo ? o.label : `${o.label} — indisponible pour cette catégorie`}
            onClick={() => onPick(o.id)}
          >
            {o.label}
            {!dispo && <span className="langbtn-x" aria-hidden>∅</span>}
          </button>
        );
      })}
    </div>
  );
}
