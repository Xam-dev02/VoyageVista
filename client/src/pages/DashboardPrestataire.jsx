import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Toast, StatusBadge, StarRating, euros } from '../components/ui';
import './DashboardPrestataire.css';

const TABS = [
  { key: 'dashboard',    label: 'Tableau de bord' },
  { key: 'offres',       label: 'Mes offres' },
  { key: 'reservations', label: 'Réservations' },
  { key: 'avis',         label: 'Avis' },
  { key: 'profil',       label: 'Mon profil' },
];

const TYPE_COLORS = {
  hebergement: 'presta-badge--sky',
  activite:    'presta-badge--gold',
  transport:   'presta-badge--lime',
};
const TYPE_LABELS = { hebergement: 'Hébergement', activite: 'Activité', transport: 'Transport' };

/* ── Composant principal ─────────────────────────────────────────── */
export default function DashboardPrestataire() {
  const { user } = useAuth();
  const [tab, setTab]           = useState('dashboard');
  const [offres, setOffres]     = useState([]);
  const [stats, setStats]       = useState(null);
  const [reservations, setReservations] = useState([]);
  const [avis, setAvis]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editOffre, setEditOffre]   = useState(null);
  const [destinations, setDestinations] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [s, o, r, av, d] = await Promise.all([
        api.get('/prestataire/stats'),
        api.get('/prestataire/offres'),
        api.get('/prestataire/reservations'),
        api.get('/prestataire/avis'),
        api.get('/destinations'),
      ]);
      setStats(s);
      setOffres(o.offres || []);
      setReservations(r.reservations || []);
      setAvis(av.avis || []);
      setDestinations(d.destinations || []);
    } catch (e) { setToast(e.message || 'Erreur de chargement.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (offre) => {
    if (!window.confirm(`Supprimer « ${offre.nom} » ?`)) return;
    try {
      const endpoint = offre.categorie === 'hebergement' ? `/hebergements/${offre.id}`
                     : offre.categorie === 'activite'    ? `/activites/${offre.id}`
                     : `/transports/${offre.id}`;
      await api.del(endpoint);
      setToast('Offre supprimée.');
      load();
    } catch (e) { setToast(e.message || 'Erreur.'); }
  };

  return (
    <div className="presta-page page">
      <div className="container section">
        <h1 className="display-xl presta-title">PRESTATAIRE</h1>

        <div className="presta-layout">

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="presta-sidebar">
            {TABS.map(t => (
              t.key === 'profil'
                ? <Link key={t.key} to="/profil" className="pill presta-tab-pill pill--ghost">{t.label}</Link>
                : <button key={t.key}
                    className={`pill presta-tab-pill${tab === t.key ? ' pill--active' : ' pill--ghost'}`}
                    onClick={() => setTab(t.key)}>
                    {t.label}
                  </button>
            ))}
          </aside>

          {/* ── Contenu principal ────────────────────────────────── */}
          <main className="presta-main">
            {loading && <Loader />}

            {/* ─── TABLEAU DE BORD ─── */}
            {!loading && tab === 'dashboard' && (
              <>
                <div className="presta-stats">
                  <div className="presta-stat presta-stat--sky">
                    <div className="presta-stat__val">{stats?.offres_actives ?? '—'}</div>
                    <div className="presta-stat__lbl">Offres actives</div>
                  </div>
                  <div className="presta-stat presta-stat--gold">
                    <div className="presta-stat__val">{stats?.reservations_mois ?? '—'}</div>
                    <div className="presta-stat__lbl">Réservations ce mois</div>
                  </div>
                  <div className="presta-stat presta-stat--coral">
                    <div className="presta-stat__val">
                      {stats?.note_moyenne != null ? <>★ {stats.note_moyenne}</> : '—'}
                    </div>
                    <div className="presta-stat__lbl">Note moyenne</div>
                  </div>
                </div>

                <OffresCard offres={offres.slice(0, 6)} onDelete={handleDelete} onEdit={setEditOffre} />

                <button className="btn btn--dark presta-add-btn" onClick={() => setShowModal(true)}>
                  Ajouter une offre +
                </button>
              </>
            )}

            {/* ─── MES OFFRES ─── */}
            {!loading && tab === 'offres' && (
              <>
                <OffresCard offres={offres} onDelete={handleDelete} onEdit={setEditOffre} full />
                <button className="btn btn--dark presta-add-btn" onClick={() => setShowModal(true)}>
                  Ajouter une offre +
                </button>
              </>
            )}

            {/* ─── RÉSERVATIONS ─── */}
            {!loading && tab === 'reservations' && (
              <div className="card-dark presta-card">
                <h2 className="presta-card-title">MES RÉSERVATIONS</h2>
                {reservations.length === 0
                  ? <p className="presta-empty">Aucune réservation pour le moment.</p>
                  : <table className="presta-table">
                      <thead><tr>
                        <th>Référence</th><th>Voyageur</th><th>Voyage</th><th>Statut</th><th>Montant</th>
                      </tr></thead>
                      <tbody>
                        {reservations.map(r => (
                          <tr key={r.reference}>
                            <td><strong>{r.reference}</strong></td>
                            <td>{r.voyageur}</td>
                            <td>{r.voyage_titre}</td>
                            <td><StatusBadge statut={r.statut} /></td>
                            <td className="presta-price">{euros(r.montant_total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            )}

            {/* ─── AVIS ─── */}
            {!loading && tab === 'avis' && (
              <div className="card-dark presta-card">
                <h2 className="presta-card-title">AVIS CLIENTS</h2>
                {avis.length === 0
                  ? <p className="presta-empty">Aucun avis pour le moment.</p>
                  : <div className="presta-avis-list">
                      {avis.map((a, i) => (
                        <div key={i} className="presta-avis-item">
                          <div className="presta-avis-header">
                            <StarRating note={a.note} size="1rem" />
                            <span className="presta-avis-offre">{a.offre_nom}</span>
                            <span className="presta-avis-date">{a.date_avis}</span>
                          </div>
                          <p className="presta-avis-auteur">{a.auteur}</p>
                          {a.commentaire && <p className="presta-avis-comment">"{a.commentaire}"</p>}
                        </div>
                      ))}
                    </div>
                }
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Modales ─────────────────────────────────────────────── */}
      {showModal && (
        <ModalAjout
          destinations={destinations}
          userId={user?.id_utilisateur}
          onClose={() => setShowModal(false)}
          onCreated={(msg) => { setToast(msg); setShowModal(false); load(); }}
        />
      )}

      {editOffre && (
        <ModalEdit
          offre={editOffre}
          onClose={() => setEditOffre(null)}
          onSaved={() => { setToast('Offre mise à jour.'); setEditOffre(null); load(); }}
        />
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

/* ── Tableau des offres ──────────────────────────────────────────── */
function OffresCard({ offres, onDelete, onEdit, full }) {
  return (
    <div className="card-dark presta-card">
      <h2 className="presta-card-title">MES OFFRES</h2>
      {offres.length === 0
        ? <p className="presta-empty">Aucune offre. Ajoutez votre première offre !</p>
        : <table className="presta-table">
            <thead><tr>
              <th>Nom</th><th>Type</th><th>Statut</th><th>Prix</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {offres.map(o => (
                <tr key={`${o.categorie}-${o.id}`}>
                  <td className="presta-name">{o.nom}</td>
                  <td>
                    <span className={`presta-badge ${TYPE_COLORS[o.categorie] || ''}`}>
                      {TYPE_LABELS[o.categorie] || o.categorie}
                    </span>
                  </td>
                  <td><StatusBadge statut={o.statut} /></td>
                  <td className="presta-price">{euros(o.prix)}{o.categorie === 'hebergement' ? '/nuit' : o.categorie === 'activite' ? '/pers.' : ''}</td>
                  <td className="presta-actions">
                    {o.categorie !== 'transport' && (
                      <button className="pill pill--sm" onClick={() => onEdit(o)}>Modifier</button>
                    )}
                    <button className="pill pill--sm presta-btn-delete" onClick={() => onDelete(o)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      }
    </div>
  );
}

/* ── Modal Modifier ─────────────────────────────────────────────── */
function ModalEdit({ offre, onClose, onSaved }) {
  const [form, setForm] = useState({ nom: offre.nom, prix: offre.prix });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const endpoint = offre.categorie === 'hebergement' ? `/hebergements/${offre.id}` : `/activites/${offre.id}`;
      const body = offre.categorie === 'hebergement'
        ? { nom: form.nom, prix_nuit: Number(form.prix) }
        : { nom: form.nom, prix_personne: Number(form.prix) };
      await api.put(endpoint, body);
      onSaved();
    } catch (e2) { setErr(e2.message || 'Erreur.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="presta-modal-overlay" onClick={onClose}>
      <div className="presta-modal" onClick={e => e.stopPropagation()}>
        <h3 className="presta-modal-title">Modifier l'offre</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nom</label>
            <input className="input" value={form.nom} onChange={e => set('nom', e.target.value)} required />
          </div>
          <div className="field">
            <label>Prix (€)</label>
            <input className="input" type="number" min="0" step="0.01" value={form.prix} onChange={e => set('prix', e.target.value)} required />
          </div>
          {err && <p style={{ color: 'var(--danger)', marginBottom: 8 }}>{err}</p>}
          <div className="flex gap-8 mt-16">
            <button type="submit" className="btn btn--dark" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button type="button" className="btn btn--outline" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Modal Ajouter ──────────────────────────────────────────────── */
const HEB_TYPES  = ['hotel','villa','auberge','resort','appartement'];
const ACT_TYPES  = ['culture','aventure','gastronomie','nature','bienetre','sport'];
const TRANS_TYPES = ['avion','train','voiture','ferry'];

function ModalAjout({ destinations, userId, onClose, onCreated }) {
  const [offerType, setOfferType] = useState('hebergement');
  const [form, setForm]           = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    try {
      if (offerType === 'hebergement') {
        await api.post('/hebergements', {
          nom: form.nom, type: form.type_heb || 'hotel',
          etoiles: Number(form.etoiles) || 3,
          prix_nuit: Number(form.prix) || 0,
          capacite: Number(form.capacite) || 2,
          description: form.description || '',
          adresse: form.adresse || '',
          equipements: form.equipements || '',
          photo_url: form.photo_url || '',
          statut: 'en_attente',
          id_destination: Number(form.id_destination) || null,
          id_prestataire: userId,
        });
      } else if (offerType === 'activite') {
        await api.post('/activites', {
          nom: form.nom, description: form.description || '',
          type: form.type_act || 'culture',
          prix_personne: Number(form.prix) || 0,
          duree_heures: Number(form.duree) || 1,
          capacite_max: Number(form.capacite) || 10,
          places_disponibles: Number(form.capacite) || 10,
          photo_url: form.photo_url || '',
          statut: 'en_attente',
          id_destination: Number(form.id_destination) || null,
          id_prestataire: userId,
        });
      } else {
        await api.post('/transports', {
          type: form.type_trans || 'avion',
          compagnie: form.compagnie || '',
          numero: form.numero || '',
          date_depart: form.date_depart,
          date_arrivee: form.date_arrivee,
          classe: form.classe || 'economique',
          prix: Number(form.prix) || 0,
          places_totales: Number(form.capacite) || 100,
          places_disponibles: Number(form.capacite) || 100,
          id_origine: Number(form.id_origine) || null,
          id_arrivee: Number(form.id_arrivee) || null,
          id_prestataire: userId,
        });
      }
      onCreated(`Offre « ${form.nom || ''} » créée — en attente de validation.`);
    } catch (e) { setFormError(e.message || 'Erreur.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="presta-modal-overlay" onClick={onClose}>
      <div className="presta-modal presta-modal--lg" onClick={e => e.stopPropagation()}>
        <h3 className="presta-modal-title">Ajouter une offre</h3>

        <div className="flex gap-8 mb-16">
          {['hebergement','activite','transport'].map(t => (
            <button key={t} type="button"
              className={`pill pill--sm${offerType === t ? ' pill--active' : ' pill--ghost'}`}
              onClick={() => { setOfferType(t); setForm({}); }}>
              {t === 'hebergement' ? 'Hébergement' : t === 'activite' ? 'Activité' : 'Transport'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field"><label>Nom</label>
            <input className="input" required value={form.nom ?? ''} onChange={e => set('nom', e.target.value)} placeholder="Nom de l'offre" /></div>

          <div className="field"><label>Description</label>
            <textarea className="textarea" value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Description…" rows={2} /></div>

          <div className="grid grid-2 gap-16">
            <div className="field"><label>Prix (€)</label>
              <input className="input" type="number" min="0" step="0.01" required value={form.prix ?? ''} onChange={e => set('prix', e.target.value)} /></div>
            <div className="field"><label>Capacité</label>
              <input className="input" type="number" min="1" value={form.capacite ?? ''} onChange={e => set('capacite', e.target.value)} /></div>
          </div>

          {offerType === 'hebergement' && <>
            <div className="grid grid-2 gap-16">
              <div className="field"><label>Type</label>
                <select className="select" value={form.type_heb ?? 'hotel'} onChange={e => set('type_heb', e.target.value)}>
                  {HEB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="field"><label>Étoiles</label>
                <select className="select" value={form.etoiles ?? '3'} onChange={e => set('etoiles', e.target.value)}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            </div>
            <div className="field"><label>Destination</label>
              <select className="select" value={form.id_destination ?? ''} onChange={e => set('id_destination', e.target.value)}>
                <option value="">Choisir…</option>
                {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}</select></div>
            <div className="field"><label>Adresse</label>
              <input className="input" value={form.adresse ?? ''} onChange={e => set('adresse', e.target.value)} placeholder="Adresse complète" /></div>
            <div className="field"><label>Photo URL</label>
              <input className="input" type="url" value={form.photo_url ?? ''} onChange={e => set('photo_url', e.target.value)} placeholder="https://…" /></div>
          </>}

          {offerType === 'activite' && <>
            <div className="grid grid-2 gap-16">
              <div className="field"><label>Type</label>
                <select className="select" value={form.type_act ?? 'culture'} onChange={e => set('type_act', e.target.value)}>
                  {ACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="field"><label>Durée (h)</label>
                <input className="input" type="number" min="0.5" step="0.5" value={form.duree ?? ''} onChange={e => set('duree', e.target.value)} /></div>
            </div>
            <div className="field"><label>Destination</label>
              <select className="select" value={form.id_destination ?? ''} onChange={e => set('id_destination', e.target.value)}>
                <option value="">Choisir…</option>
                {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}</select></div>
            <div className="field"><label>Photo URL</label>
              <input className="input" type="url" value={form.photo_url ?? ''} onChange={e => set('photo_url', e.target.value)} placeholder="https://…" /></div>
          </>}

          {offerType === 'transport' && <>
            <div className="grid grid-2 gap-16">
              <div className="field"><label>Type</label>
                <select className="select" value={form.type_trans ?? 'avion'} onChange={e => set('type_trans', e.target.value)}>
                  {TRANS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="field"><label>Compagnie</label>
                <input className="input" value={form.compagnie ?? ''} onChange={e => set('compagnie', e.target.value)} placeholder="Ex: Air France" /></div>
            </div>
            <div className="grid grid-2 gap-16">
              <div className="field"><label>Départ</label>
                <select className="select" value={form.id_origine ?? ''} onChange={e => set('id_origine', e.target.value)}>
                  <option value="">Origine…</option>
                  {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}</option>)}</select></div>
              <div className="field"><label>Arrivée</label>
                <select className="select" value={form.id_arrivee ?? ''} onChange={e => set('id_arrivee', e.target.value)}>
                  <option value="">Destination…</option>
                  {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}</option>)}</select></div>
            </div>
            <div className="grid grid-2 gap-16">
              <div className="field"><label>Date départ</label>
                <input className="input" type="datetime-local" value={form.date_depart ?? ''} onChange={e => set('date_depart', e.target.value)} required /></div>
              <div className="field"><label>Date arrivée</label>
                <input className="input" type="datetime-local" value={form.date_arrivee ?? ''} onChange={e => set('date_arrivee', e.target.value)} required /></div>
            </div>
          </>}

          {formError && <p style={{ color: 'var(--danger)', marginBottom: 8 }}>{formError}</p>}
          <div className="flex gap-8 mt-16">
            <button type="submit" className="btn btn--dark" disabled={submitting}>
              {submitting ? 'Envoi…' : 'Créer l\'offre'}
            </button>
            <button type="button" className="btn btn--outline" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
