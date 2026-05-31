import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, StatusBadge, Toast, euros } from '../components/ui';
import './DashboardPrestataire.css';

/* ------------------------------------------------------------------ */
/* Constantes                                                           */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'offres',    label: 'Mes offres' },
  { key: 'reservations', label: 'Réservations' },
];

const TYPE_LABELS = {
  hebergement: 'Hébergement',
  activite:    'Activité',
  transport:   'Transport',
};

/* Champs requis par type d'offre pour le formulaire d'ajout */
const HEBERGEMENT_TYPES = ['hotel', 'appartement', 'villa', 'auberge', 'resort', 'autre'];
const ACTIVITE_TYPES    = ['visite', 'sport', 'gastronomie', 'culture', 'nature', 'aventure', 'detente', 'autre'];
const TRANSPORT_TYPES   = ['avion', 'train', 'bus', 'ferry', 'voiture', 'autre'];

/* ------------------------------------------------------------------ */
/* Composant principal                                                  */
/* ------------------------------------------------------------------ */
export default function DashboardPrestataire() {
  const { user } = useAuth();
  const [tab, setTab]           = useState('dashboard');
  const [offres, setOffres]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [toast, setToast]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [destinations, setDestinations] = useState([]);

  /* ---- Chargement des offres ---- */
  const fetchOffres = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.get('/hebergements'),
        api.get('/activites'),
        api.get('/transports'),
      ]);

      const merged = [];

      /* Hébergements */
      if (results[0].status === 'fulfilled') {
        const list = results[0].value?.hebergements ?? [];
        list
          .filter(h => h.id_prestataire === user.id_utilisateur)
          .forEach(h => merged.push({
            _type: 'hebergement',
            id: h.id_hebergement,
            nom: h.nom,
            prix: h.prix_nuit,
            statut: h.statut,
            raw: h,
          }));
      }

      /* Activités */
      if (results[1].status === 'fulfilled') {
        const list = results[1].value?.activites ?? [];
        list
          .filter(a => a.id_prestataire === user.id_utilisateur)
          .forEach(a => merged.push({
            _type: 'activite',
            id: a.id_activite,
            nom: a.nom,
            prix: a.prix_personne,
            statut: a.statut,
            raw: a,
          }));
      }

      /* Transports */
      if (results[2].status === 'fulfilled') {
        const list = results[2].value?.transports ?? [];
        list
          .filter(t => t.id_prestataire === user.id_utilisateur || t.id_prestataire == null)
          /* transports n'ont pas forcément id_prestataire — on filtre si présent */
          .filter(t => t.id_prestataire === user.id_utilisateur)
          .forEach(t => merged.push({
            _type: 'transport',
            id: t.id_transport,
            nom: t.compagnie ? `${t.compagnie} — ${t.numero ?? ''}` : (t.numero ?? `Transport #${t.id_transport}`),
            prix: t.prix,
            statut: t.statut ?? 'disponible',
            raw: t,
          }));
      }

      setOffres(merged);
    } catch (e) {
      setError(e.message ?? 'Erreur lors du chargement des offres.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /* ---- Chargement destinations (pour modal) ---- */
  const fetchDestinations = useCallback(async () => {
    try {
      const res = await api.get('/destinations');
      setDestinations(res.destinations ?? []);
    } catch {
      /* endpoint peut ne pas encore exister */
      setDestinations([]);
    }
  }, []);

  useEffect(() => {
    fetchOffres();
    fetchDestinations();
  }, [fetchOffres, fetchDestinations]);

  /* ---- Suppression ---- */
  const handleDelete = async (offre) => {
    if (!window.confirm(`Supprimer « ${offre.nom} » ? Cette action est irréversible.`)) return;
    const endpointMap = { hebergement: '/hebergements', activite: '/activites', transport: '/transports' };
    try {
      await api.del(`${endpointMap[offre._type]}/${offre.id}`);
      setToast('Offre supprimée avec succès.');
      fetchOffres();
    } catch (e) {
      setToast(`Erreur : ${e.message}`);
    }
  };

  /* ---- Stats ---- */
  const offresActives  = offres.filter(o => o.statut === 'disponible' || o.statut === 'approuve').length;
  const offresAttente  = offres.filter(o => o.statut === 'en_attente').length;

  return (
    <div className="presta-page">
      {/* ---- En-tête géant ---- */}
      <div className="container">
        <div className="presta-hero">
          <div>
            <p className="presta-label">MON ESPACE</p>
            <h1 className="display-xl presta-title">PRESTATAIRE</h1>
          </div>
          <div className="presta-user-badge">
            <span>{user?.prenom} {user?.nom}</span>
          </div>
        </div>
      </div>

      {/* ---- Corps en 2 colonnes ---- */}
      <div className="container presta-body">

        {/* Sidebar */}
        <aside className="presta-sidebar">
          <nav className="flex-col gap-8">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`pill presta-pill ${tab === t.key ? 'pill--active' : 'pill--dark'}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenu */}
        <main className="presta-main">
          {tab === 'dashboard' && (
            <DashboardTab
              offresActives={offresActives}
              offresAttente={offresAttente}
              loading={loading}
            />
          )}
          {tab === 'offres' && (
            <OffresTab
              offres={offres}
              loading={loading}
              error={error}
              onDelete={handleDelete}
              onAdd={() => setShowModal(true)}
            />
          )}
          {tab === 'reservations' && (
            <ReservationsTab />
          )}
        </main>
      </div>

      {/* ---- Bouton flottant "Ajouter une offre" toujours visible ---- */}
      <div className="presta-fab-wrap container">
        <button className="btn btn--white presta-fab" onClick={() => setShowModal(true)}>
          Ajouter une offre +
        </button>
      </div>

      {/* ---- Modal ajout ---- */}
      {showModal && (
        <ModalAjout
          destinations={destinations}
          userId={user?.id_utilisateur}
          onClose={() => setShowModal(false)}
          onCreated={(msg) => { setToast(msg); setShowModal(false); fetchOffres(); }}
        />
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Tableau de bord                                               */
/* ------------------------------------------------------------------ */
function DashboardTab({ offresActives, offresAttente, loading }) {
  return (
    <section>
      <h2 className="presta-section-title">Tableau de bord</h2>
      {loading ? <Loader /> : (
        <div className="presta-stats">
          <StatCard value={offresActives} label="Offres actives"   color="sky" />
          <StatCard value={offresAttente}  label="En attente"       color="gold" />
        </div>
      )}
    </section>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className={`presta-stat-card bg-${color}`}>
      <span className="presta-stat-value">{value}</span>
      <span className="presta-stat-label">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Mes offres                                                    */
/* ------------------------------------------------------------------ */
function OffresTab({ offres, loading, error, onDelete, onAdd }) {
  if (loading) return <Loader />;
  if (error)   return <p className="presta-error">{error}</p>;

  return (
    <section>
      <div className="flex-between mb-24">
        <h2 className="presta-section-title">MES OFFRES</h2>
        <button className="btn btn--lime" onClick={onAdd}>Ajouter une offre +</button>
      </div>

      {offres.length === 0 ? (
        <div className="card-dark presta-empty">
          <p>Vous n'avez pas encore d'offre.</p>
          <button className="btn btn--lime mt-16" onClick={onAdd}>Créer votre première offre</button>
        </div>
      ) : (
        <div className="card-dark">
          <table className="presta-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Prix</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offres.map(offre => (
                <tr key={`${offre._type}-${offre.id}`}>
                  <td className="presta-table-name">{offre.nom}</td>
                  <td>
                    <span className={`presta-type-badge presta-type-${offre._type}`}>
                      {TYPE_LABELS[offre._type]}
                    </span>
                  </td>
                  <td><StatusBadge statut={offre.statut} /></td>
                  <td className="price">{euros(offre.prix)}</td>
                  <td className="presta-actions">
                    <button className="pill pill--sm" disabled title="Modification à venir">Modifier</button>
                    <button
                      className="pill pill--sm presta-btn-delete"
                      onClick={() => onDelete(offre)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Réservations (placeholder)                                    */
/* ------------------------------------------------------------------ */
function ReservationsTab() {
  return (
    <section>
      <h2 className="presta-section-title">Réservations</h2>
      <div className="card-dark presta-empty">
        <p>Les réservations liées à vos offres apparaîtront ici.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Modal — Ajouter une offre                                            */
/* ------------------------------------------------------------------ */
function ModalAjout({ destinations, userId, onClose, onCreated }) {
  const [offerType, setOfferType] = useState('hebergement');
  const [form, setForm]           = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      let body = { ...form, id_prestataire: userId, statut: 'en_attente' };

      if (offerType === 'hebergement') {
        await api.post('/hebergements', {
          nom:         body.nom,
          type:        body.type_heberg ?? 'hotel',
          etoiles:     Number(body.etoiles) || 3,
          prix_nuit:   Number(body.prix) || 0,
          capacite:    Number(body.capacite) || 1,
          description: body.description ?? '',
          adresse:     body.adresse ?? '',
          equipements: body.equipements ?? '',
          photo_url:   body.photo_url ?? '',
          statut:      'en_attente',
          id_destination: Number(body.id_destination) || null,
          id_prestataire: userId,
        });
      } else if (offerType === 'activite') {
        await api.post('/activites', {
          nom:           body.nom,
          description:   body.description ?? '',
          type:          body.type_act ?? 'visite',
          prix_personne: Number(body.prix) || 0,
          duree_heures:  Number(body.duree_heures) || 1,
          capacite_max:  Number(body.capacite) || 10,
          places_disponibles: Number(body.capacite) || 10,
          photo_url:     body.photo_url ?? '',
          statut:        'en_attente',
          id_destination: Number(body.id_destination) || null,
          id_prestataire: userId,
        });
      } else if (offerType === 'transport') {
        await api.post('/transports', {
          type:          body.type_transport ?? 'avion',
          compagnie:     body.compagnie ?? '',
          numero:        body.numero ?? '',
          date_depart:   body.date_depart,
          date_arrivee:  body.date_arrivee,
          classe:        body.classe ?? 'economique',
          prix:          Number(body.prix) || 0,
          places_totales: Number(body.capacite) || 100,
          places_disponibles: Number(body.capacite) || 100,
          id_origine:    Number(body.id_origine) || null,
          id_arrivee:    Number(body.id_arrivee) || null,
          id_prestataire: userId,
        });
      }

      onCreated(`Offre « ${body.nom || ''} » créée et en attente de validation.`);
    } catch (err) {
      setFormError(err.message ?? 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="presta-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="presta-modal card-dark">
        <div className="flex-between mb-24">
          <h2 className="display-md" style={{ color: '#fff' }}>Ajouter une offre</h2>
          <button className="presta-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Sélecteur de type */}
        <div className="flex gap-8 mb-24 wrap">
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`pill ${offerType === key ? 'pill--active' : ''}`}
              style={{ color: offerType !== key ? '#fff' : undefined, borderColor: '#fff' }}
              onClick={() => { setOfferType(key); setForm({}); }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Champs communs */}
          <div className="field">
            <label>Nom *</label>
            <input className="input" required value={form.nom ?? ''} onChange={e => set('nom', e.target.value)} placeholder="Nom de l'offre" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="textarea" value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Description…" />
          </div>
          <div className="field">
            <label>Prix (€) *</label>
            <input className="input" type="number" min="0" step="0.01" required value={form.prix ?? ''} onChange={e => set('prix', e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Photo URL</label>
            <input className="input" type="url" value={form.photo_url ?? ''} onChange={e => set('photo_url', e.target.value)} placeholder="https://…" />
          </div>

          {/* Champs spécifiques hébergement */}
          {offerType === 'hebergement' && (
            <>
              <div className="field">
                <label>Type d'hébergement</label>
                <select className="select" value={form.type_heberg ?? 'hotel'} onChange={e => set('type_heberg', e.target.value)}>
                  {HEBERGEMENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="presta-grid-2">
                <div className="field">
                  <label>Étoiles</label>
                  <input className="input" type="number" min="1" max="5" value={form.etoiles ?? 3} onChange={e => set('etoiles', e.target.value)} />
                </div>
                <div className="field">
                  <label>Capacité</label>
                  <input className="input" type="number" min="1" value={form.capacite ?? 1} onChange={e => set('capacite', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Adresse</label>
                <input className="input" value={form.adresse ?? ''} onChange={e => set('adresse', e.target.value)} placeholder="Adresse complète" />
              </div>
              <div className="field">
                <label>Destination *</label>
                <select className="select" required value={form.id_destination ?? ''} onChange={e => set('id_destination', e.target.value)}>
                  <option value="">-- Choisir une destination --</option>
                  {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Champs spécifiques activité */}
          {offerType === 'activite' && (
            <>
              <div className="field">
                <label>Type d'activité</label>
                <select className="select" value={form.type_act ?? 'visite'} onChange={e => set('type_act', e.target.value)}>
                  {ACTIVITE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="presta-grid-2">
                <div className="field">
                  <label>Durée (heures)</label>
                  <input className="input" type="number" min="0.5" step="0.5" value={form.duree_heures ?? 1} onChange={e => set('duree_heures', e.target.value)} />
                </div>
                <div className="field">
                  <label>Capacité max</label>
                  <input className="input" type="number" min="1" value={form.capacite ?? 10} onChange={e => set('capacite', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Destination *</label>
                <select className="select" required value={form.id_destination ?? ''} onChange={e => set('id_destination', e.target.value)}>
                  <option value="">-- Choisir une destination --</option>
                  {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Champs spécifiques transport */}
          {offerType === 'transport' && (
            <>
              <div className="field">
                <label>Type de transport</label>
                <select className="select" value={form.type_transport ?? 'avion'} onChange={e => set('type_transport', e.target.value)}>
                  {TRANSPORT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="presta-grid-2">
                <div className="field">
                  <label>Compagnie</label>
                  <input className="input" value={form.compagnie ?? ''} onChange={e => set('compagnie', e.target.value)} placeholder="Ex : Air France" />
                </div>
                <div className="field">
                  <label>Numéro de vol / ligne</label>
                  <input className="input" value={form.numero ?? ''} onChange={e => set('numero', e.target.value)} placeholder="AF123" />
                </div>
              </div>
              <div className="presta-grid-2">
                <div className="field">
                  <label>Date de départ *</label>
                  <input className="input" type="datetime-local" required value={form.date_depart ?? ''} onChange={e => set('date_depart', e.target.value)} />
                </div>
                <div className="field">
                  <label>Date d'arrivée *</label>
                  <input className="input" type="datetime-local" required value={form.date_arrivee ?? ''} onChange={e => set('date_arrivee', e.target.value)} />
                </div>
              </div>
              <div className="presta-grid-2">
                <div className="field">
                  <label>Classe</label>
                  <select className="select" value={form.classe ?? 'economique'} onChange={e => set('classe', e.target.value)}>
                    {['economique','business','premiere'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Places disponibles</label>
                  <input className="input" type="number" min="1" value={form.capacite ?? 100} onChange={e => set('capacite', e.target.value)} />
                </div>
              </div>
              <div className="presta-grid-2">
                <div className="field">
                  <label>Destination origine</label>
                  <select className="select" value={form.id_origine ?? ''} onChange={e => set('id_origine', e.target.value)}>
                    <option value="">-- Origine --</option>
                    {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Destination arrivée</label>
                  <select className="select" value={form.id_arrivee ?? ''} onChange={e => set('id_arrivee', e.target.value)}>
                    <option value="">-- Arrivée --</option>
                    {destinations.map(d => <option key={d.id_destination} value={d.id_destination}>{d.nom}, {d.pays}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {formError && <p className="presta-form-error">{formError}</p>}

          <div className="flex gap-12 mt-24">
            <button type="submit" className="btn btn--lime" disabled={submitting}>
              {submitting ? 'Envoi…' : 'Créer l\'offre'}
            </button>
            <button type="button" className="btn btn--outline" style={{ color: '#fff', borderColor: '#fff' }} onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
