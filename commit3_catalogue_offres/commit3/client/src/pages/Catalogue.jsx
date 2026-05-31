import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Toast } from '../components/ui';
import './Catalogue.css';

const CATEGORIES = [
  { label: 'Tout',     value: '' },
  { label: 'Plage',    value: 'plage' },
  { label: 'Montagne', value: 'montagne' },
  { label: 'Ville',    value: 'ville' },
  { label: 'Culture',  value: 'culture' },
  { label: 'Aventure', value: 'aventure' },
];

const ACCENTS = ['#4DB8FF', '#FFD23F', '#FF4D8D', '#27C06B', '#7B2FE0', '#00C9B1', '#FF8A3D', '#C6F432'];

export default function Catalogue() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Recherche/filtre persistés dans l'URL (?q=...&categorie=...)
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const [categorie, setCategorie] = useState(params.get('categorie') || '');

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [addedIds, setAddedIds] = useState(new Set());
  const [toast, setToast] = useState('');

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Synchronise la recherche/filtre dans l'URL (retour arrière = recherche conservée)
  useEffect(() => {
    const p = {};
    if (search) p.q = search;
    if (categorie) p.categorie = categorie;
    setParams(p, { replace: true });
  }, [search, categorie, setParams]);

  const fetchDestinations = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const p = {};
      if (debouncedSearch) p.q = debouncedSearch;
      if (categorie) p.categorie = categorie;
      const data = await api.get('/destinations', p);
      setDestinations(data.destinations ?? []);
    } catch (err) {
      setError(err.message || 'Impossible de charger les destinations.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categorie]);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

  // Villes déjà dans l'itinéraire (pour l'état "Ajouté")
  const loadPanier = useCallback(() => {
    if (!user) { setAddedIds(new Set()); return; }
    api.get('/voyages/panier')
      .then(d => setAddedIds(new Set((d.voyage?.etapes || []).map(e => e.destination?.id_destination))))
      .catch(() => {});
  }, [user]);
  useEffect(() => { loadPanier(); }, [loadPanier]);

  async function quickAdd(e, dest) {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/connexion'); return; }
    try {
      const { voyage } = await api.get('/voyages/panier');
      await api.post(`/voyages/${voyage.id_voyage}/etapes`, { id_destination: dest.id_destination });
      setAddedIds(prev => new Set(prev).add(dest.id_destination));
      setToast(`${dest.nom} ajouté à votre itinéraire`);
    } catch (err) {
      if (err.status === 401) navigate('/connexion');
      else setToast(err.message || 'Ajout impossible.');
    }
  }

  return (
    <div className="catalogue-page">
      <div className="container">
        <h1 className="cat-title">Destinations</h1>

        <div className="cat-bar">
          <div className="cat-filters">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                className={`cat-pill${categorie === c.value ? ' cat-pill--active' : ''}`}
                onClick={() => setCategorie(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <input
            className="cat-search"
            type="text"
            placeholder="Rechercher une destination..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Rechercher une destination"
          />
        </div>

        {error && <div className="cat-error">{error}</div>}

        {loading ? <Loader /> : destinations.length === 0 ? (
          <p className="cat-empty">Aucune destination trouvée.</p>
        ) : (
          <div className="cat-grid">
            {destinations.map((dest, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              const added = addedIds.has(dest.id_destination);
              return (
                <Link
                  key={dest.id_destination}
                  to={`/destinations/${dest.id_destination}`}
                  className="dcard"
                  style={{ borderColor: accent }}
                >
                  {dest.photo_url
                    ? <img className="dcard__img" src={dest.photo_url} alt={dest.nom} loading="lazy" />
                    : <div className="dcard__img" style={{ background: accent }} />}
                  <div className="dcard__scrim" />

                  {/* Ajout rapide à l'itinéraire */}
                  <button
                    className={`dcard__add${added ? ' dcard__add--done' : ''}`}
                    onClick={(e) => quickAdd(e, dest)}
                    title={added ? 'Déjà dans votre itinéraire' : 'Ajouter à mon itinéraire'}
                    aria-label={added ? 'Déjà ajouté' : 'Ajouter à mon itinéraire'}
                  >
                    {added ? '✓' : '+'}
                  </button>

                  <div className="dcard__head">
                    <div className="dcard__nom">{dest.nom}</div>
                    <div className="dcard__pays">{dest.pays}</div>
                  </div>
                  <span className="dcard__cat">{dest.categorie}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
