import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Loader, Toast, StatusBadge } from '../components/ui';
import './DashboardAdmin.css';

const SECTIONS = [
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'offres', label: 'Offres' },
  { key: 'utilisateurs', label: 'Utilisateurs' },
];

export default function DashboardAdmin() {
  const [section, setSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [offres, setOffres] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, o, u] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/offres_attente'),
        api.get('/admin/utilisateurs'),
      ]);
      setStats(s);
      setOffres(o.offres || []);
      setUsers(u.users || []);
    } catch (e) {
      setToast(e.message || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function validerOffre(o, statut) {
    await api.put(`/admin/offres/${o.categorie_offre}/${o.id}`, { statut });
    setToast(statut === 'disponible' ? 'Offre approuvée.' : 'Offre rejetée.');
    load();
  }
  async function changerRole(id, role) { await api.put(`/admin/utilisateurs/${id}/role`, { role }); setToast('Rôle mis à jour.'); load(); }
  async function changerStatut(id, statut) { await api.put(`/admin/utilisateurs/${id}/statut`, { statut }); load(); }
  async function supprimerUser(id) {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await api.del(`/admin/utilisateurs/${id}`); setToast('Utilisateur supprimé.'); load();
  }

  const STAT_CARDS = stats ? [
    { label: 'Utilisateurs', value: stats.utilisateurs, cls: 'bg-sky' },
    { label: 'Offres actives', value: stats.offres_actives, cls: 'bg-gold' },
    { label: 'Réservations', value: stats.reservations, cls: 'bg-pink' },
    { label: 'En attente', value: stats.en_attente, cls: 'bg-lime' },
  ] : [];

  return (
    <div className="admin-page page">
      <div className="container section">
        <h1 className="display-lg admin-title">ADMIN</h1>

        <div className="admin-body">
          <aside className="admin-sidebar">
            {SECTIONS.map(s => (
              <button key={s.key}
                className={`pill admin-menu-pill${section === s.key ? ' pill--active' : ' pill--ghost'}`}
                onClick={() => setSection(s.key)}>{s.label}</button>
            ))}
          </aside>

          <main className="admin-main">
            {loading && <Loader />}

            {!loading && (section === 'dashboard' || section === 'offres') && (
              <section className="admin-stats">
                {STAT_CARDS.map(c => (
                  <div key={c.label} className={`admin-stat-card ${c.cls}`}>
                    <div className="admin-stat-value">{c.value}</div>
                    <div className="admin-stat-label">{c.label}</div>
                  </div>
                ))}
              </section>
            )}

            {!loading && (section === 'dashboard' || section === 'offres') && (
              <section className="mt-32">
                <h3 className="admin-section-title">Offres en attente de validation</h3>
                {offres.length === 0 ? (
                  <p className="admin-empty">Aucune offre en attente.</p>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>Prestataire</th><th>Type</th><th>Offre</th><th>Statut</th><th>Actions</th></tr></thead>
                    <tbody>
                      {offres.map(o => (
                        <tr key={`${o.categorie_offre}-${o.id}`}>
                          <td>{o.prestataire}</td>
                          <td><span className="pill pill--sm">{o.categorie_offre}</span></td>
                          <td className="admin-name">{o.nom}</td>
                          <td><StatusBadge statut={o.statut} /></td>
                          <td className="admin-actions">
                            <button className="pill pill--sm admin-approve" onClick={() => validerOffre(o, 'disponible')}>Approuver</button>
                            <button className="pill pill--sm admin-reject" onClick={() => validerOffre(o, 'rejete')}>Rejeter</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )}

            {!loading && (section === 'dashboard' || section === 'utilisateurs') && (
              <section className="mt-32">
                <h3 className="admin-section-title">Utilisateurs</h3>
                <table className="admin-table">
                  <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id_utilisateur}>
                        <td className="admin-name">{u.prenom} {u.nom}</td>
                        <td>{u.email}</td>
                        <td>
                          <select className="select admin-role-select" value={u.role}
                            onChange={e => changerRole(u.id_utilisateur, e.target.value)}>
                            <option value="voyageur">Voyageur</option>
                            <option value="prestataire">Prestataire</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td><StatusBadge statut={u.statut} /></td>
                        <td className="admin-actions">
                          <button className="pill pill--sm" onClick={() => changerStatut(u.id_utilisateur, u.statut === 'actif' ? 'inactif' : 'actif')}>
                            {u.statut === 'actif' ? 'Désactiver' : 'Activer'}
                          </button>
                          <button className="pill pill--sm admin-reject" onClick={() => supprimerUser(u.id_utilisateur)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </main>
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
