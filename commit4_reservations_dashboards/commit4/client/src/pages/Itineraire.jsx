import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader, Toast, euros } from '../components/ui';
import './Itineraire.css';

function fmtDate(dt) {
  if (!dt) return '';
  const d = new Date(dt.replace(' ', 'T'));
  if (isNaN(d)) return dt;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function Itineraire() {
  const navigate = useNavigate();
  const [voyage, setVoyage] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [newDest, setNewDest] = useState('');

  // Booking d'activité
  const [actChoices, setActChoices] = useState([]);
  const [selActivite, setSelActivite] = useState('');
  const [actDate, setActDate] = useState('');
  const [actPers, setActPers] = useState(1);

  const load = useCallback(async () => {
    try {
      const d = await api.get('/voyages/panier');
      setVoyage(d.voyage);
    } catch (e) { setError(e.message || 'Erreur de chargement.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/destinations').then(d => setDestinations(d.destinations || [])).catch(() => {}); }, []);

  const etapes = voyage?.etapes || [];
  const active = etapes[activeIdx];
  const activeDestId = active?.destination?.id_destination;

  // Activités proposées pour la destination de l'étape active
  useEffect(() => {
    if (!activeDestId) { setActChoices([]); return; }
    api.get('/activites', { id_destination: activeDestId })
      .then(d => setActChoices(d.activites || []))
      .catch(() => setActChoices([]));
    setSelActivite(''); setActDate(''); setActPers(1);
  }, [activeDestId]);

  function notify(e, fallback) { setToast(e?.message || fallback); }

  async function ajouterEtape() {
    if (!newDest) { setToast('Choisissez une destination.'); return; }
    try {
      await api.post(`/voyages/${voyage.id_voyage}/etapes`, { id_destination: Number(newDest) });
      setNewDest(''); setToast('Étape ajoutée.'); await load();
    } catch (e) { notify(e, 'Erreur lors de l\'ajout.'); }
  }

  async function supprimerEtape(idEtape) {
    if (!window.confirm('Retirer cette étape de votre itinéraire ?')) return;
    try {
      await api.del(`/voyages/etapes/${idEtape}`);
      setActiveIdx(0); setToast('Étape retirée.'); await load();
    } catch (e) { notify(e, 'Suppression impossible.'); }
  }

  // Déplacer l'étape active (échange des ordres avec la voisine)
  async function deplacer(dir) {
    const j = activeIdx + dir;
    if (j < 0 || j >= etapes.length) return;
    const a = etapes[activeIdx], b = etapes[j];
    try {
      await api.put(`/voyages/etapes/${a.id_etape}`, { ordre: b.ordre });
      await api.put(`/voyages/etapes/${b.id_etape}`, { ordre: a.ordre });
      setActiveIdx(j); await load();
    } catch (e) { notify(e, 'Réorganisation impossible.'); }
  }

  async function majDates(idEtape, champ, valeur) {
    try { await api.put(`/voyages/etapes/${idEtape}`, { [champ]: valeur }); await load(); }
    catch (e) { notify(e, 'Mise à jour impossible.'); }
  }

  async function ajouterActivite() {
    if (!selActivite) { setToast('Choisissez une activité.'); return; }
    try {
      await api.post(`/voyages/etapes/${active.id_etape}/activites`, {
        id_activite: Number(selActivite),
        nb_personnes: Number(actPers) || 1,
        date_heure: actDate || null,
      });
      setSelActivite(''); setActDate(''); setActPers(1);
      setToast('Activité ajoutée.'); await load();
    } catch (e) { notify(e, 'Ajout de l\'activité impossible.'); }
  }

  async function retirerActivite(idEA) {
    try { await api.del(`/voyages/activites/${idEA}`); setToast('Activité retirée.'); await load(); }
    catch (e) { notify(e, 'Suppression impossible.'); }
  }

  async function retirerTransport(idEtape) {
    try { await api.put(`/voyages/etapes/${idEtape}`, { id_transport: null }); setToast('Transport retiré.'); await load(); }
    catch (e) { notify(e, 'Suppression impossible.'); }
  }

  async function retirerHebergement(idEtape) {
    try { await api.put(`/voyages/etapes/${idEtape}`, { id_hebergement: null }); setToast('Hébergement retiré.'); await load(); }
    catch (e) { notify(e, 'Suppression impossible.'); }
  }

  async function majVoyageurs(nb) {
    if (!voyage || nb < 1) return;
    try { await api.put(`/voyages/${voyage.id_voyage}`, { nb_voyageurs: Number(nb) }); await load(); }
    catch (e) { notify(e, 'Mise à jour impossible.'); }
  }

  if (loading) return <div className="page"><Loader /></div>;
  if (error) return <div className="page"><div className="container section"><p className="card-dark" style={{ padding: 20 }}>{error}</p></div></div>;

  return (
    <div className="itin-page page">
      <div className="container section">
        <div className="flex-between wrap gap-16 mb-8">
          <h1 className="display-xl itin-title">MON ITINÉRAIRE</h1>
          <div className="itin-voyageurs">
            <label>Voyageurs</label>
            <input type="number" min="1" className="input itin-pers"
              value={voyage?.nb_voyageurs || 1}
              onChange={e => majVoyageurs(e.target.value)} />
          </div>
        </div>

        {/* Pills d'étapes (ordre = position) */}
        {etapes.length > 0 && (
          <div className="flex wrap gap-8 itin-steps">
            {etapes.map((e, i) => (
              <button key={e.id_etape} className={`pill${i === activeIdx ? ' pill--active' : ''}`} onClick={() => setActiveIdx(i)}>
                Étape {i + 1} · {e.destination?.nom}
              </button>
            ))}
          </div>
        )}

        {/* Ajout d'étape */}
        <div className="itin-add card">
          <select className="select" value={newDest} onChange={e => setNewDest(e.target.value)}>
            <option value="">+ Ajouter une ville à mon voyage…</option>
            {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}
          </select>
          <button className="btn btn--dark" onClick={ajouterEtape}>Ajouter l'étape</button>
        </div>

        {etapes.length === 0 && (
          <div className="card itin-empty">
            <p>Votre itinéraire est vide. Ajoutez une première ville ci-dessus, ou explorez le <Link to="/destinations">catalogue</Link>.</p>
          </div>
        )}

        {active && (
          <div className="card-dark itin-detail">
            <div className="itin-detail__head">
              <h2 className="display-md">Étape {activeIdx + 1} — {active.destination?.nom}</h2>
              <div className="itin-step-actions">
                <button className="pill pill--sm" disabled={activeIdx === 0} onClick={() => deplacer(-1)}>↑ Monter</button>
                <button className="pill pill--sm" disabled={activeIdx === etapes.length - 1} onClick={() => deplacer(1)}>↓ Descendre</button>
                <button className="pill pill--sm pill--ghost itin-del" onClick={() => supprimerEtape(active.id_etape)}>Retirer</button>
              </div>
            </div>

            <div className="grid grid-2 gap-16 mt-16">
              <div className="field"><label>Arrivée</label>
                <input type="date" className="input" value={active.date_arrivee || ''} onChange={e => majDates(active.id_etape, 'date_arrivee', e.target.value)} /></div>
              <div className="field"><label>Départ</label>
                <input type="date" className="input" value={active.date_depart || ''} onChange={e => majDates(active.id_etape, 'date_depart', e.target.value)} /></div>
            </div>

            <hr className="divider" />

            {/* Transport */}
            <div className="itin-line">
              <span className="itin-line__label">Transport</span>
              {active.transport ? (
                <div className="itin-item-row">
                  <span>{active.transport.compagnie} — {euros(active.transport.prix)}</span>
                  <Link to="/transports" className="pill pill--sm">Changer</Link>
                  <button className="pill pill--sm pill--ghost" onClick={() => retirerTransport(active.id_etape)}>Retirer ×</button>
                </div>
              ) : (
                <Link to="/transports" className="pill pill--sm">Ajouter +</Link>
              )}
            </div>
            {/* Hébergement */}
            <div className="itin-line">
              <span className="itin-line__label">Hébergement</span>
              {active.hebergement ? (
                <div className="itin-item-row">
                  <span>{active.hebergement.nom} — {euros(active.hebergement.prix_nuit)}/nuit × {active.nuits || 1}</span>
                  <Link to="/hebergements" className="pill pill--sm">Changer</Link>
                  <button className="pill pill--sm pill--ghost" onClick={() => retirerHebergement(active.id_etape)}>Retirer ×</button>
                </div>
              ) : (
                <Link to="/hebergements" className="pill pill--sm">Ajouter +</Link>
              )}
            </div>

            {/* Activités : liste + booking daté */}
            <div className="itin-line itin-line--col">
              <span className="itin-line__label">Activités</span>
              <div className="itin-acts">
                {(active.activites || []).map(a => (
                  <div key={a.id_etape_activite} className="itin-act">
                    <span>{a.nom} · {a.nb_personnes} pers.{a.date_heure ? ` · ${fmtDate(a.date_heure)}` : ''} — {euros(a.prix_calcule)}</span>
                    <button className="pill pill--sm pill--ghost" onClick={() => retirerActivite(a.id_etape_activite)}>×</button>
                  </div>
                ))}
                {(active.activites || []).length === 0 && <p className="itin-act-empty">Aucune activité réservée pour cette étape.</p>}
              </div>

              {/* Formulaire d'ajout d'activité */}
              <div className="itin-act-form">
                <select className="select" value={selActivite} onChange={e => setSelActivite(e.target.value)}>
                  <option value="">Choisir une activité…</option>
                  {actChoices.map(a => (
                    <option key={a.id_activite} value={a.id_activite} disabled={a.statut === 'complet' || a.places_disponibles === 0}>
                      {a.nom} — {euros(a.prix_personne)}/pers.{(a.statut === 'complet' || a.places_disponibles === 0) ? ' (complet)' : ''}
                    </option>
                  ))}
                </select>
                <input type="date" className="input" value={actDate}
                  min={active.date_arrivee || undefined} max={active.date_depart || undefined}
                  onChange={e => setActDate(e.target.value)} title="Date de l'activité" />
                <input type="number" className="input itin-pers" min="1" value={actPers}
                  onChange={e => setActPers(e.target.value)} title="Nombre de personnes" />
                <button className="btn btn--lime" onClick={ajouterActivite} disabled={!actChoices.length}>Réserver</button>
              </div>
              {actChoices.length === 0 && <p className="itin-act-empty">Aucune activité disponible pour {active.destination?.nom} pour le moment.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Barre sticky total */}
      <div className="itin-bar">
        <div className="container flex-between">
          <span className="itin-total">Total : {euros(voyage?.prix_total)}</span>
          <button className="btn btn--dark" disabled={etapes.length === 0} onClick={() => navigate('/panier')}>Valider l'itinéraire</button>
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
