import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Toast, StarRating, euros } from '../components/ui';
import './Hebergements.css';

const TYPES = [
  { key: '', label: 'Tout' },
  { key: 'hotel', label: 'Hôtel' },
  { key: 'villa', label: 'Villa' },
  { key: 'auberge', label: 'Auberge' },
  { key: 'resort', label: 'Resort' },
  { key: 'appartement', label: 'Appartement' },
];

export default function Hebergements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pré-remplissage depuis l'itinéraire
  const etapeId    = searchParams.get('etape') ? Number(searchParams.get('etape')) : null;
  const initDest   = searchParams.get('id_destination') || '';
  const initArr    = searchParams.get('date_arrivee') || '';
  const initDep    = searchParams.get('date_depart') || '';

  const [items, setItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [type, setType] = useState('');
  const [idDest, setIdDest] = useState(initDest);
  const [etoilesMin, setEtoilesMin] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/destinations').then(d => setDestinations(d.destinations || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { statut: 'disponible' };
      if (type) params.type = type;
      if (idDest) params.id_destination = idDest;
      if (etoilesMin) params.etoiles_min = etoilesMin;
      if (prixMax) params.prix_max = prixMax;
      if (q) params.q = q;
      const d = await api.get('/hebergements', params);
      setItems(d.hebergements || []);
    } catch (e) { setError(e.message || 'Erreur de chargement.'); }
    finally { setLoading(false); }
  }, [type, idDest, etoilesMin, prixMax, q]);

  useEffect(() => { load(); }, [type, idDest]); // eslint-disable-line

  async function reserver(h) {
    if (!user) { navigate('/connexion'); return; }
    try {
      if (etapeId) {
        // Vient de l'itinéraire : on sait exactement quelle étape mettre à jour
        await api.put(`/voyages/etapes/${etapeId}`, { id_hebergement: h.id_hebergement });
        setToast(`${h.nom} ajouté à votre itinéraire !`);
        setTimeout(() => navigate('/itineraire'), 1200);
      } else {
        const { voyage } = await api.get('/voyages/panier');
        const etape = (voyage.etapes || []).find(e => e.destination?.id_destination === h.id_destination);
        if (etape) {
          await api.put(`/voyages/etapes/${etape.id_etape}`, { id_hebergement: h.id_hebergement });
        } else {
          const r = await api.post(`/voyages/${voyage.id_voyage}/etapes`, { id_destination: h.id_destination });
          const maj = r.voyage || (await api.get('/voyages/panier')).voyage;
          const nouvelle = (maj.etapes || []).filter(e => e.destination?.id_destination === h.id_destination).pop();
          if (nouvelle) await api.put(`/voyages/etapes/${nouvelle.id_etape}`, { id_hebergement: h.id_hebergement });
        }
        navigate('/itineraire');
      }
    } catch (e) {
      if (e.status === 401) navigate('/connexion');
      else setToast(e.message || 'Erreur.');
    }
  }

  // Nom de la destination sélectionnée (pour la bannière)
  const nomDest = destinations.find(d => String(d.id_destination) === String(idDest))?.nom;

  return (
    <div className="heb-page page">
      <div className="container section">
        <h1 className="display-xl heb-title">HÉBERGEMENTS</h1>

        {/* Bannière de contexte quand on vient de l'itinéraire */}
        {etapeId && (
          <div className="heb-context card">
            <span>
              Recherche pour <strong>{nomDest || 'votre étape'}</strong>
              {initArr && ` · Arrivée ${initArr}`}
              {initDep && ` · Départ ${initDep}`}
            </span>
            <Link to="/itineraire" className="pill pill--sm pill--ghost">← Retour à l'itinéraire</Link>
          </div>
        )}

        <div className="flex wrap gap-8 mb-16">
          {TYPES.map(t => (
            <button key={t.key} className={`pill${type === t.key ? ' pill--active' : ''}`} onClick={() => setType(t.key)}>{t.label}</button>
          ))}
        </div>

        <div className="heb-filters card">
          <div className="field"><label>Destination</label>
            <select className="select" value={idDest} onChange={e => setIdDest(e.target.value)}>
              <option value="">Toutes</option>
              {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}</option>)}
            </select></div>
          <div className="field"><label>Étoiles min.</label>
            <select className="select" value={etoilesMin} onChange={e => setEtoilesMin(e.target.value)}>
              <option value="">—</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select></div>
          <div className="field"><label>Prix max / nuit</label>
            <input className="input" type="number" value={prixMax} onChange={e => setPrixMax(e.target.value)} placeholder="€" /></div>
          <div className="field heb-search"><label>Recherche</label>
            <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Nom de l'hébergement…" /></div>
          <button className="btn btn--dark heb-search-btn" onClick={load}>Filtrer</button>
        </div>

        {loading && <Loader />}
        {error && !loading && <p className="heb-error card-dark">{error}</p>}
        {!loading && !error && items.length === 0 && <div className="card heb-empty"><p>Aucun hébergement trouvé.</p></div>}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-3 mt-24">
            {items.map(h => (
              <article key={h.id_hebergement} className="card heb-card">
                {h.photo_url
                  ? <img className="heb-card__img" src={h.photo_url} alt={h.nom}
                      referrerPolicy="no-referrer" loading="lazy"
                      onError={e => { e.target.style.display = 'none'; }} />
                  : <div className="heb-card__img heb-card__img--placeholder" />}
                <div className="heb-card__body">
                  <div className="flex-between gap-8">
                    <span className="pill pill--sm">{h.type}</span>
                    <StarRating note={h.etoiles} />
                  </div>
                  <h3 className="heb-card__name">{h.nom}</h3>
                  <p className="muted heb-card__dest">{h.nom_destination}</p>
                  <div className="flex-between mt-8">
                    <span className="price heb-card__prix">{euros(h.prix_nuit)} <small>/ nuit</small></span>
                    <button className="btn btn--dark" onClick={() => reserver(h)}>Réserver</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
