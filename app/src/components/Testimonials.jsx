// Petite preuve sociale humaine : des candidats qui ont eu leur code.
const BASE = import.meta.env.BASE_URL + 'images/people/';
const PEOPLE = [
  { img: 'p1.jpg', name: 'Aymen', who: '21 ans · Tunis',
    quote: 'Eu le code du premier coup. Les séries ici sont les mêmes qu’à l’ATTT.' },
  { img: 'p2.jpg', name: 'Salma', who: '19 ans · Sfax',
    quote: 'L’examen blanc chronométré m’a appris à gérer le stress du jour J.' },
  { img: 'p3.jpg', name: 'Mehdi', who: '24 ans · Sousse',
    quote: 'La révision des erreurs m’a fait progresser en une semaine.' },
];

export default function Testimonials() {
  return (
    <section className="testi">
      <h3>Ils ont décroché leur code</h3>
      <div className="testi-grid">
        {PEOPLE.map((p) => (
          <figure className="testi-card" key={p.name}>
            <img className="testi-av" src={BASE + p.img} alt={p.name} loading="lazy" />
            <blockquote>« {p.quote} »</blockquote>
            <figcaption><b>{p.name}</b> · {p.who}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
