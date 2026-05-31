import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader } from '../components/ui';
import './Home.css';

const LABEL_COLORS = ['var(--sky)', 'var(--pink)', 'var(--gold)', 'var(--teal)', 'var(--violet)', 'var(--coral)', 'var(--lime)'];

export default function Home() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dest, setDest] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [dateRetour, setDateRetour] = useState('');
  const [voyageurs, setVoyageurs] = useState('');

  useEffect(() => {
    api.get('/destinations')
      .then((d) => setDestinations(d?.destinations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function rechercher(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dest) params.set('q', dest);
    if (dateDepart) params.set('date_depart', dateDepart);
    if (dateRetour) params.set('date_retour', dateRetour);
    if (voyageurs) params.set('voyageurs', voyageurs);
    navigate(`/destinations${params.toString() ? '?' + params.toString() : ''}`);
  }

  return (
    <div className="lp">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="lp-hero">
        <h1 className="lp-hero__title">COMPOSEZ<br />VOTRE VOYAGE</h1>

        <form className="lp-search" onSubmit={rechercher}>
          <div className="lp-search__field">
            <label>Destination</label>
            <input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Où partir ?" />
          </div>
          <div className="lp-search__sep" />
          <div className="lp-search__field">
            <label>Départ</label>
            <input type="date" value={dateDepart}
              onChange={e => { setDateDepart(e.target.value); if (dateRetour && e.target.value > dateRetour) setDateRetour(''); }} />
          </div>
          <div className="lp-search__sep" />
          <div className="lp-search__field">
            <label>Retour</label>
            <input type="date" value={dateRetour} min={dateDepart || undefined}
              onChange={e => setDateRetour(e.target.value)} />
          </div>
          <div className="lp-search__sep" />
          <div className="lp-search__field">
            <label>Voyageurs</label>
            <input type="number" min="1" value={voyageurs} onChange={(e) => setVoyageurs(e.target.value)} placeholder="2" />
          </div>
          <button type="submit" className="lp-search__cta">Rechercher</button>
        </form>
      </section>

      {/* ── DESTINATIONS ─────────────────────────────────────── */}
      <section className="lp-destinations">
        <div className="container">
          <div className="lp-destinations__head">
            <h2 className="display-md">Nos destinations</h2>
            <Link to="/destinations" className="pill pill--dark">Tout voir</Link>
          </div>

          {loading ? <Loader /> : (
            <div className="lp-dest-row">
              {destinations.map((d, i) => (
                <Link key={d.id_destination} to={`/destinations/${d.id_destination}`} className="lp-dest-card">
                  {d.photo_url
                    ? <img className="lp-dest-card__img" src={d.photo_url} alt={d.nom} referrerPolicy="no-referrer" loading="lazy" />
                    : <div className="lp-dest-card__img" style={{ background: LABEL_COLORS[i % LABEL_COLORS.length] }} />}
                  <div className="lp-dest-card__label" style={{ background: LABEL_COLORS[i % LABEL_COLORS.length] }}>
                    {d.nom}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BANDEAU FINAL ────────────────────────────────────── */}
      <section className="lp-cta bg-dark">
        <div className="container lp-cta__inner">
          <h2 className="display-lg">Prêt à partir&nbsp;?</h2>
          <p>Créez votre compte et composez votre itinéraire sur mesure en quelques minutes.</p>
          <Link to="/connexion" className="btn btn--lime btn--lg">Créer mon compte</Link>
        </div>
      </section>
    </div>
  );
}
