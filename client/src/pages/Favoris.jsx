import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader, Toast } from '../components/ui';
import './Favoris.css';

export default function Favoris() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/favoris')
      .then(d => setDestinations(d.destinations || []))
      .catch(e => setToast(e.message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function retirer(id) {
    try {
      await api.del(`/favoris/${id}`);
      setDestinations(prev => prev.filter(d => d.id_destination !== id));
    } catch (e) { setToast(e.message || 'Erreur.'); }
  }

  return (
    <div className="favoris-page page">
      <div className="container section">
        <h1 className="display-xl favoris-title">MES FAVORIS</h1>

        {loading && <Loader />}

        {!loading && destinations.length === 0 && (
          <div className="card favoris-empty">
            <p>Vous n'avez aucune destination favorite.</p>
            <Link to="/destinations" className="btn btn--dark mt-16">Explorer les destinations</Link>
          </div>
        )}

        {!loading && destinations.length > 0 && (
          <div className="favoris-grid">
            {destinations.map(d => (
              <article key={d.id_destination} className="favoris-card">
                <Link to={`/destinations/${d.id_destination}`} className="favoris-card__link">
                  {d.photo_url
                    ? <img className="favoris-card__img" src={d.photo_url} alt={d.nom} loading="lazy" referrerPolicy="no-referrer"
                        onError={e => { e.target.style.display = 'none'; }} />
                    : <div className="favoris-card__img favoris-card__img--ph" />}
                  <div className="favoris-card__body">
                    <h3 className="favoris-card__nom">{d.nom}</h3>
                    <p className="favoris-card__pays">{d.pays}</p>
                  </div>
                </Link>
                <button className="favoris-card__remove" onClick={() => retirer(d.id_destination)} title="Retirer des favoris">♥</button>
              </article>
            ))}
          </div>
        )}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
