import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Toast, StatusBadge, euros } from '../components/ui';
import './Profil.css';

export default function Profil() {
  const { setUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [voyages, setVoyages] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    api.get('/users/me')
      .then(d => setForm({ ...d.user, mot_de_passe: '' }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
    api.get('/voyages').then(d => setVoyages(d.voyages || [])).catch(() => {});
    api.get('/reservations').then(d => setReservations(d.reservations || [])).catch(() => {});
  }, []);

  function reload() {
    api.get('/voyages').then(d => setVoyages(d.voyages || [])).catch(() => {});
    api.get('/reservations').then(d => setReservations(d.reservations || [])).catch(() => {});
  }

  async function supprimerVoyage(id, titre) {
    if (!window.confirm(`Supprimer l'itinéraire « ${titre} » ?`)) return;
    try { await api.del(`/voyages/${id}`); setToast('Itinéraire supprimé.'); reload(); }
    catch (e) { setToast(e.message || 'Erreur.'); }
  }

  async function annulerReservation(id, ref) {
    if (!window.confirm(`Annuler la réservation ${ref} ?`)) return;
    try { await api.del(`/reservations/${id}`); setToast('Réservation annulée.'); reload(); }
    catch (e) { setToast(e.message || 'Erreur.'); }
  }

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        nom: form.nom, prenom: form.prenom,
        telephone: form.telephone, photo_profil: form.photo_profil,
      };
      if (form.mot_de_passe) payload.mot_de_passe = form.mot_de_passe;
      const d = await api.put('/users/me', payload);
      setForm(f => ({ ...f, ...d.user, mot_de_passe: '' }));
      setUser(u => (u ? { ...u, nom: d.user.nom, prenom: d.user.prenom } : u));
      setToast('Profil mis à jour avec succès.');
    } catch (e2) {
      setError(e2.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><Loader /></div>;
  if (error && !form) return <div className="page"><div className="container section"><p className="card-dark" style={{ padding: 20 }}>{error}</p></div></div>;

  return (
    <div className="profil-page page">
      <div className="container section">
        <h1 className="display-lg profil-title">MON PROFIL</h1>

        <div className="profil-layout">
          {/* Formulaire */}
          <form className="card-dark profil-form" onSubmit={save}>
            <h3 className="mb-16">Mes informations</h3>
            <div className="grid grid-2 gap-16">
              <div className="field"><label>Prénom</label>
                <input className="input" value={form.prenom || ''} onChange={e => update('prenom', e.target.value)} /></div>
              <div className="field"><label>Nom</label>
                <input className="input" value={form.nom || ''} onChange={e => update('nom', e.target.value)} /></div>
            </div>
            <div className="field"><label>Email</label>
              <input className="input" value={form.email || ''} disabled /></div>
            <div className="field"><label>Téléphone</label>
              <input className="input" value={form.telephone || ''} onChange={e => update('telephone', e.target.value)} /></div>
            <div className="field"><label>Photo de profil (URL)</label>
              <input className="input" value={form.photo_profil || ''} onChange={e => update('photo_profil', e.target.value)} /></div>
            <div className="field"><label>Nouveau mot de passe (optionnel)</label>
              <input className="input" type="password" value={form.mot_de_passe || ''} onChange={e => update('mot_de_passe', e.target.value)} placeholder="Laisser vide pour ne pas changer" /></div>
            {error && <p className="profil-error">{error}</p>}
            <button className="btn btn--lime btn--block mt-8" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
            <p className="muted mt-16" style={{ color: '#bbb' }}>Compte {form.role} · inscrit le {form.date_inscription}</p>
          </form>

          {/* Récap */}
          <div className="profil-side">
            <div className="card profil-block">
              <h3 className="mb-16">Mes itinéraires</h3>
              {voyages.length === 0 && <p className="muted">Aucun itinéraire.</p>}
              {voyages.map(v => (
                <div key={v.id_voyage} className="profil-row">
                  <div><strong>{v.titre}</strong><br /><StatusBadge statut={v.statut} /></div>
                  <div className="profil-row-actions">
                    <span className="price">{euros(v.prix_total)}</span>
                    <button className="pill pill--sm pill--ghost profil-del"
                      onClick={() => supprimerVoyage(v.id_voyage, v.titre)}>Supprimer</button>
                  </div>
                </div>
              ))}
              <Link to="/itineraire" className="pill pill--sm mt-8">Composer un voyage</Link>
            </div>

            <div className="card profil-block">
              <h3 className="mb-16">Mes réservations</h3>
              {reservations.length === 0 && <p className="muted">Aucune réservation.</p>}
              {reservations.map(r => (
                <div key={r.id_reservation} className="profil-row">
                  <div><strong>{r.reference}</strong><br /><StatusBadge statut={r.statut} /></div>
                  <div className="profil-row-actions">
                    <span className="price">{euros(r.montant_total)}</span>
                    {r.statut !== 'annulee' && (
                      <>
                        <Link to="/itineraire" className="pill pill--sm">Modifier</Link>
                        <button className="pill pill--sm pill--ghost profil-del"
                          onClick={() => annulerReservation(r.id_reservation, r.reference)}>Annuler</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
