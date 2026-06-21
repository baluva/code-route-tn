// Sélecteur de catégorie de permis (moto, voiture, poids lourd, bus, remorque… + fiches texte).
export default function CategoryBar({ catalog, catId, onPick }) {
  if (!catalog) return null;
  return (
    <div className="catbar" role="tablist" aria-label="Catégorie de permis">
      <span className="catbar-lbl">Catégorie</span>
      <div className="catchips">
        {catalog.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === catId}
            className={`catchip ${c.id === catId ? 'active' : ''}`}
            onClick={() => onPick(c.id)}
            title={c.label}
          >
            <span className="catchip-lbl">{c.label}</span>
            {typeof c.questions === 'number' && <span className="catchip-n">{c.questions}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
