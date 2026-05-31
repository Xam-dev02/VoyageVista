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
  const [dates, setDates] = useState('');
  const [voyageurs, setVoyageurs] = useState('');

  useEffect(() => {
    api.get('/destinations')
      .then((d) => setDestinations(d?.destinations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function rechercher(e) {
    e.preventDefault();
    navigate(dest ? `/destinations?q=${encodeURIComponent(dest)}` : '/destinations');
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
            <label>Dates</label>
            <input type="date" value={dates} onChange={(e) => setDates(e.target.value)} />
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
                  <div className="lp-dest-card__img" style={{ backgroundImage: `url(${d.photo_url})` }} />
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
