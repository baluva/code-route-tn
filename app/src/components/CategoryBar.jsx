import CatIcon from './CatIcon.jsx';

// Noms des catégories de permis, localisés. Fallback sur le label des données si id inconnu.
const NAMES = {
  fr: {
    A: 'Moto', B: 'Voiture', G: 'Tracteur agricole', C: 'Poids lourd',
    CE: 'Poids lourd + remorque', D: 'Transport en commun', BE: 'Voiture + remorque',
    DE: 'Bus + remorque', txt: 'Voiture · fiches',
  },
  ar: {
    A: 'دراجة نارية', B: 'سيارة', G: 'جرّار فلاحي', C: 'شاحنة ثقيلة',
    CE: 'شاحنة + مقطورة', D: 'نقل جماعي', BE: 'سيارة + مقطورة',
    DE: 'حافلة + مقطورة', txt: 'سيارة · بطاقات',
  },
};

// Sélecteur de catégorie de permis (moto, voiture, poids lourd, bus, remorque… + fiches texte).
export default function CategoryBar({ catalog, catId, onPick, lang = 'fr' }) {
  if (!catalog) return null;
  const ar = lang === 'ar';
  return (
    <div className="catbar" role="tablist" aria-label="Catégorie de permis">
      <span className="catbar-lbl">{ar ? 'الصنف' : 'Catégorie'}</span>
      <div className="catchips">
        {catalog.map((c) => {
          const name = (NAMES[lang] && NAMES[lang][c.id]) || c.label;
          const code = c.id === 'txt' ? 'TXT' : c.id.toUpperCase();
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === catId}
              className={`catchip ${c.id === catId ? 'active' : ''}`}
              onClick={() => onPick(c.id)}
              title={name}
            >
              <CatIcon id={c.id} />
              <span className="catchip-code">{code}</span>
              <span className="catchip-lbl" dir={ar ? 'rtl' : 'ltr'}>{name}</span>
              {typeof c.questions === 'number' && <span className="catchip-n">{c.questions}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
