import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Loader } from '../components/ui';
import './Notifications.css';

const LABELS = {
  reservation: 'Réservation',
  modification: 'Modification',
  rappel: 'Rappel',
  promotion: 'Promotion',
  systeme: 'Système',
};

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt.replace(' ', 'T')).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.get('/notifications');
      setNotifs(data.notifications || []);
      setNonLues(data.non_lues || 0);
    } catch (e) {
      setError(e.message || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function marquerLue(id) { await api.put(`/notifications/${id}`); load(); }
  async function toutMarquer() { await api.put('/notifications'); load(); }
  async function supprimer(id) { await api.del(`/notifications/${id}`); load(); }

  return (
    <div className="notif-page page">
      <div className="container section">
        <div className="flex-between wrap gap-16 mb-24">
          <div>
            <h1 className="display-lg">NOTIFICATIONS</h1>
            <p className="notif-count">{nonLues} non lue{nonLues > 1 ? 's' : ''}</p>
          </div>
          {notifs.length > 0 && (
            <button className="btn btn--white" onClick={toutMarquer}>Tout marquer comme lu</button>
          )}
        </div>

        {loading && <Loader />}
        {error && !loading && <p className="notif-error card-dark">{error}</p>}

        {!loading && !error && notifs.length === 0 && (
          <div className="card notif-empty"><p>Aucune notification pour le moment.</p></div>
        )}

        {!loading && !error && notifs.length > 0 && (
          <ul className="notif-list">
            {notifs.map(n => (
              <li key={n.id_notification} className={`notif-item card${n.est_lue ? '' : ' notif-item--unread'}`}>
                <span className={`notif-tag notif-tag--${n.type}`}>{LABELS[n.type] || 'Info'}</span>
                <div className="notif-body">
                  <div className="notif-titre">{n.titre}</div>
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-date muted">{formatDate(n.date_creation)}</div>
                </div>
                <div className="notif-actions">
                  {!n.est_lue && (
                    <button className="pill pill--sm" onClick={() => marquerLue(n.id_notification)}>Marquer comme lu</button>
                  )}
                  <button className="pill pill--sm pill--ghost" onClick={() => supprimer(n.id_notification)}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
