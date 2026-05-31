import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Toast, euros } from '../components/ui';
import './Activites.css';

const TYPES = [
  { key: '', label: 'Tout' },
  { key: 'culture', label: 'Culture' },
  { key: 'aventure', label: 'Aventure' },
  { key: 'gastronomie', label: 'Gastronomie' },
  { key: 'nature', label: 'Nature' },
  { key: 'bienetre', label: 'Bien-être' },
  { key: 'sport', label: 'Sport' },
];

export default function Activites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [type, setType] = useState('');
  const [idDest, setIdDest] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => { api.get('/destinations').then(d => setDestinations(d.destinations || [])).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (type) params.type = type;
      if (idDest) params.id_destination = idDest;
      if (prixMax) params.prix_max = prixMax;
      if (q) params.q = q;
      const d = await api.get('/activites', params);
      setItems(d.activites || []);
    } catch (e) { setError(e.message || 'Erreur de chargement.'); }
    finally { setLoading(false); }
  }, [type, idDest, prixMax, q]);

  useEffect(() => { load(); }, [type, idDest]); // eslint-disable-line

  async function inscrire(a) {
    if (!user) { navigate('/connexion'); return; }
    try {
      const { voyage } = await api.get('/voyages/panier');
      let etape = (voyage.etapes || []).find(e => e.destination?.id_destination === a.id_destination);
      if (!etape) {
        const r = await api.post(`/voyages/${voyage.id_voyage}/etapes`, { id_destination: a.id_destination });
        const maj = r.voyage || (await api.get('/voyages/panier')).voyage;
        etape = (maj.etapes || []).filter(e => e.destination?.id_destination === a.id_destination).pop();
      }
      if (!etape) throw new Error("Impossible de créer l'étape.");
      await api.post(`/voyages/etapes/${etape.id_etape}/activites`, { id_activite: a.id_activite, nb_personnes: 1 });
      navigate('/itineraire');
    } catch (e) {
      if (e.status === 401) navigate('/connexion');
      else setToast(e.message || 'Erreur.');
    }
  }

  return (
    <div className="act-page page">
      <div className="container section">
        <h1 className="display-xl act-title">ACTIVITÉS</h1>

        <div className="flex wrap gap-8 mb-16">
          {TYPES.map(t => (
            <button key={t.key} className={`pill${type === t.key ? ' pill--active' : ''}`} onClick={() => setType(t.key)}>{t.label}</button>
          ))}
        </div>

        <div className="act-filters card">
          <div className="field"><label>Destination</label>
            <select className="select" value={idDest} onChange={e => setIdDest(e.target.value)}>
              <option value="">Toutes</option>
              {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}</option>)}
            </select></div>
          <div className="field"><label>Prix max / pers.</label>
            <input className="input" type="number" value={prixMax} onChange={e => setPrixMax(e.target.value)} placeholder="€" /></div>
          <div className="field act-search"><label>Recherche</label>
            <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Nom de l'activité…" /></div>
          <button className="btn btn--dark act-search-btn" onClick={load}>Filtrer</button>
        </div>

        {loading && <Loader />}
        {error && !loading && <p className="act-error card-dark">{error}</p>}
        {!loading && !error && items.length === 0 && <div className="card act-empty"><p>Aucune activité trouvée.</p></div>}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-3 mt-24">
            {items.map(a => {
              const complet = a.statut === 'complet' || Number(a.places_disponibles) === 0;
              return (
                <article key={a.id_activite} className={`card act-card${complet ? ' act-card--complet' : ''}`}>
                  <div className="act-card__img" style={{ backgroundImage: `url(${a.photo_url})` }}>
                    {complet && <span className="badge badge--danger act-complet">Complet</span>}
                  </div>
                  <div className="act-card__body">
                    <span className="pill pill--sm">{a.type}</span>
                    <h3 className="act-card__name">{a.nom}</h3>
                    <p className="muted act-card__meta">{a.duree_heures}h · {a.nom_destination}</p>
                    <p className="act-card__places">{complet ? 'Complet' : `${a.places_disponibles} place(s) restante(s)`}</p>
                    <div className="flex-between mt-8">
                      <span className="price act-card__prix">{euros(a.prix_personne)} <small>/ pers.</small></span>
                      <button className="btn btn--dark" disabled={complet} onClick={() => inscrire(a)}>
                        {complet ? 'Complet' : "S'inscrire"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
