import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Toast, euros } from '../components/ui';
import './Transports.css';

function formatDuree(min) {
  if (min == null) return '—';
  const h = Math.floor(min / 60), m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h00`;
}
function formatHeure(dt) { return dt ? dt.substring(11, 16) : '—'; }

const TYPE_PILLS = [
  { key: '', label: 'Tous' },
  { key: 'avion', label: 'Avion' },
  { key: 'train', label: 'Train' },
  { key: 'voiture', label: 'Voiture' },
  { key: 'ferry', label: 'Ferry' },
];
const TRI_OPTIONS = [
  { key: 'prix', label: 'Prix' },
  { key: 'duree', label: 'Durée' },
  { key: 'depart', label: 'Départ' },
];

export default function Transports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [destinations, setDestinations] = useState([]);
  const [voyage, setVoyage] = useState(null);
  const [idOrigine, setIdOrigine] = useState('');
  const [idArrivee, setIdArrivee] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tri, setTri] = useState('prix');
  const [currentEtapeId, setCurrentEtapeId] = useState(null);

  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState('');
  const [autoDone, setAutoDone] = useState(false);

  useEffect(() => { api.get('/destinations').then(d => setDestinations(d.destinations || [])).catch(() => {}); }, []);

  const loadVoyage = useCallback(() => {
    if (!user) return;
    api.get('/voyages/panier').then(d => setVoyage(d.voyage)).catch(() => {});
  }, [user]);
  useEffect(() => { loadVoyage(); }, [loadVoyage]);

  // Tronçons de l'itinéraire (étapes consécutives)
  const legs = useMemo(() => {
    const e = voyage?.etapes || [];
    const out = [];
    for (let i = 1; i < e.length; i++) {
      out.push({ from: e[i - 1].destination, to: e[i].destination, etapeId: e[i].id_etape, has: !!e[i].transport });
    }
    return out;
  }, [voyage]);

  const doSearch = useCallback(async (orig, arr, type, triv) => {
    if (!orig || !arr) { setTransports([]); setSearched(true); return; }
    setLoading(true); setError(''); setSearched(true);
    try {
      const params = { id_origine: orig, id_arrivee: arr, tri: triv };
      if (type) params.type = type;
      const data = await api.get('/transports', params);
      setTransports(data.transports || []);
    } catch (e) { setError(e.message || 'Erreur lors de la recherche.'); setTransports([]); }
    finally { setLoading(false); }
  }, []);

  // Pré-remplissage auto : premier tronçon sans transport (ou ?etape=)
  useEffect(() => {
    if (autoDone || legs.length === 0) return;
    const wanted = searchParams.get('etape');
    let leg = wanted ? legs.find(l => String(l.etapeId) === wanted) : null;
    if (!leg) leg = legs.find(l => !l.has) || legs[0];
    if (leg) {
      setIdOrigine(String(leg.from.id_destination));
      setIdArrivee(String(leg.to.id_destination));
      setCurrentEtapeId(leg.etapeId);
      doSearch(leg.from.id_destination, leg.to.id_destination, '', 'prix');
    }
    setAutoDone(true);
  }, [legs, autoDone, searchParams, doSearch]);

  function chooseLeg(leg) {
    setIdOrigine(String(leg.from.id_destination));
    setIdArrivee(String(leg.to.id_destination));
    setCurrentEtapeId(leg.etapeId);
    doSearch(leg.from.id_destination, leg.to.id_destination, typeFilter, tri);
  }

  function manualSearch(e) {
    e.preventDefault();
    setCurrentEtapeId(null);
    doSearch(idOrigine, idArrivee, typeFilter, tri);
  }

  // Re-cherche quand type/tri changent (si une paire est définie)
  useEffect(() => {
    if (searched && idOrigine && idArrivee) doSearch(idOrigine, idArrivee, typeFilter, tri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, tri]);

  async function handleSelect(t) {
    if (!user) { navigate('/connexion'); return; }
    try {
      if (currentEtapeId) {
        await api.put(`/voyages/etapes/${currentEtapeId}`, { id_transport: t.id_transport });
      } else {
        const { voyage: v } = await api.get('/voyages/panier');
        const arr = parseInt(t.id_arrivee, 10);
        const etape = (v.etapes || []).find(e => e.destination?.id_destination === arr);
        if (etape) {
          await api.put(`/voyages/etapes/${etape.id_etape}`, { id_transport: t.id_transport });
        } else {
          const r = await api.post(`/voyages/${v.id_voyage}/etapes`, { id_destination: arr });
          const maj = r.voyage || (await api.get('/voyages/panier')).voyage;
          const ne = (maj.etapes || []).filter(e => e.destination?.id_destination === arr).pop();
          if (ne) await api.put(`/voyages/etapes/${ne.id_etape}`, { id_transport: t.id_transport });
        }
      }
      setToast(`${t.compagnie} ajouté à votre itinéraire`);
      loadVoyage();
    } catch (e) {
      if (e.status === 401) navigate('/connexion');
      else setToast(e.message || 'Sélection impossible.');
    }
  }

  return (
    <div className="transports-page page">
      <div className="container section">
        <div className="transports-layout">
          <div className="card-dark transports-card">
            <h1 className="display-xl transports-title">TRANSPORTS</h1>

            {/* Tronçons de l'itinéraire (pré-remplissage) */}
            {legs.length > 0 && (
              <div className="transports-legs">
                <span className="transports-legs__label">Trajets de votre itinéraire :</span>
                <div className="flex wrap gap-8">
                  {legs.map((l) => (
                    <button
                      key={l.etapeId}
                      className={`pill pill--sm leg-pill${currentEtapeId === l.etapeId ? ' pill--lime-active' : ''}${l.has ? ' leg-pill--done' : ''}`}
                      onClick={() => chooseLeg(l)}
                    >
                      {l.from?.nom} → {l.to?.nom}{l.has ? ' ✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtres type */}
            <div className="flex wrap gap-8 transports-pills">
              {TYPE_PILLS.map(t => (
                <button key={t.key} className={`pill${typeFilter === t.key ? ' pill--lime-active' : ''}`} onClick={() => setTypeFilter(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Recherche manuelle */}
            <form className="transports-form" onSubmit={manualSearch}>
              <div className="grid grid-2 gap-16">
                <div className="field"><label>Origine</label>
                  <select className="select" value={idOrigine} onChange={e => { setIdOrigine(e.target.value); setCurrentEtapeId(null); }}>
                    <option value="">Choisir…</option>
                    {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}
                  </select>
                </div>
                <div className="field"><label>Destination</label>
                  <select className="select" value={idArrivee} onChange={e => { setIdArrivee(e.target.value); setCurrentEtapeId(null); }}>
                    <option value="">Choisir…</option>
                    {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-8 wrap mt-8">
                <span className="transports-tri-label">Trier :</span>
                {TRI_OPTIONS.map(o => (
                  <button key={o.key} type="button" className={`pill pill--sm${tri === o.key ? ' pill--active' : ' pill--ghost'}`} onClick={() => setTri(o.key)}>{o.label}</button>
                ))}
              </div>
              <button type="submit" className="btn btn--lime btn--lg mt-16">Rechercher</button>
            </form>

            <hr className="divider mt-24 mb-8" />

            {loading && <Loader />}
            {error && !loading && <p className="transports-error">{error}</p>}
            {!loading && !error && searched && transports.length === 0 && (
              <div className="transports-empty"><p>Choisissez une origine et une destination pour voir les trajets.</p></div>
            )}

            {!loading && !error && transports.length > 0 && (
              <ul className="transports-list">
                {transports.map((t, i) => {
                  const complet = Number(t.places_disponibles) === 0;
                  return (
                    <li key={t.id_transport}>
                      {i > 0 && <hr className="divider" />}
                      <div className={`transport-row${complet ? ' transport-row--complet' : ''}`}>
                        <div className="transport-row__info">
                          <div className="transport-row__header">
                            <span className="transport-row__compagnie">{t.compagnie}</span>
                            <span className="pill pill--sm pill--ghost transport-type-pill">{t.type}</span>
                            {complet && <span className="badge badge--muted">Complet</span>}
                          </div>
                          <div className="transport-row__route">{t.nom_origine} → {t.nom_arrivee}</div>
                          <div className="transport-row__meta">
                            <span className="transport-row__horaires">{formatHeure(t.date_depart)} → {formatHeure(t.date_arrivee)}</span>
                            <span className="pill pill--sm pill--ghost transport-duree-pill">{formatDuree(t.duree_minutes)}</span>
                            {!complet && <span className="transport-row__places">{t.places_disponibles} places</span>}
                          </div>
                        </div>
                        <div className="transport-row__action">
                          <span className="transport-row__prix price">{euros(t.prix)}</span>
                          <button className={`btn${complet ? ' btn--outline' : ' btn--lime'}`} disabled={complet} onClick={() => handleSelect(t)}>
                            {complet ? 'Complet' : 'Sélectionner'}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
