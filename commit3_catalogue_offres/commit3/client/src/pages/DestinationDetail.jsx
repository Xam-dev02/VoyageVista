import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Toast, StarRating, euros } from '../components/ui';
import './DestinationDetail.css';

/* ─── Correspondance weather_code Open-Meteo → label ──── */
function weatherLabel(code) {
  if (code === 0)                return ['Ensoleillé', ''];
  if (code <= 2)                 return ['Peu nuageux', ''];
  if (code === 3)                return ['Nuageux', ''];
  if (code >= 45 && code <= 48)  return ['Brouillard', ''];
  if (code >= 51 && code <= 55)  return ['Bruine', ''];
  if (code >= 61 && code <= 65)  return ['Pluie', ''];
  if (code >= 71 && code <= 77)  return ['Neige', ''];
  if (code >= 80 && code <= 82)  return ['Averses', ''];
  if (code >= 95 && code <= 99)  return ['Orage', ''];
  return ['Conditions inconnues', ''];
}

/* ─── Label de température pour le climat saisonnier ───────────── */
function climatLabel(max) {
  if (max == null) return '';
  if (max < 5)  return 'Froid';
  if (max < 15) return 'Frais';
  if (max < 23) return 'Doux';
  if (max < 30) return 'Chaud';
  return 'Très chaud';
}

/* ─── Sélecteur d'étoiles (formulaire avis) ────────────────────── */
function StarSelector({ value, onChange }) {
  return (
    <div className="star-selector">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn${n <= value ? ' active' : ''}`}
          onClick={() => onChange(n)}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ─── Mini-carte hébergement ────────────────────────────────────── */
function HebergementCard({ h }) {
  return (
    <div className="mini-card">
      {h.photo_url
        ? <img src={h.photo_url} alt={h.nom} className="mini-card-img" loading="lazy" />
        : <div className="mini-card-img-placeholder" />
      }
      <div className="mini-card-body">
        <div className="mini-card-name">{h.nom}</div>
        <div className="mini-card-meta">
          {'★'.repeat(h.etoiles || 0)}
        </div>
        <div className="mini-card-price">{euros(h.prix_nuit)}/nuit</div>
      </div>
    </div>
  );
}

/* ─── Mini-carte activité ───────────────────────────────────────── */
function ActiviteCard({ a }) {
  return (
    <div className="mini-card">
      {a.photo_url
        ? <img src={a.photo_url} alt={a.nom} className="mini-card-img" loading="lazy" />
        : <div className="mini-card-img-placeholder" />
      }
      <div className="mini-card-body">
        <div className="mini-card-name">{a.nom}</div>
        <div className="mini-card-meta">{a.duree_heures}h</div>
        <div className="mini-card-price">{euros(a.prix_personne)}/pers.</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Page principale
   ═══════════════════════════════════════════════════════════════════ */
export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ── Destination ─────────────────────────────────────────────── */
  const [destination, setDestination] = useState(null);
  const [loadingDest, setLoadingDest]  = useState(true);
  const [errorDest, setErrorDest]      = useState(null);

  /* ── Météo ───────────────────────────────────────────────────── */
  const [weather, setWeather]           = useState(null);
  const [climat, setClimat]             = useState([]);

  /* ── Hébergements ───────────────────────────────────────────── */
  const [hebergements, setHebergements] = useState([]);
  const [loadingHeb, setLoadingHeb]     = useState(true);
  const [errorHeb, setErrorHeb]         = useState(null);

  /* ── Activités ──────────────────────────────────────────────── */
  const [activites, setActivites]       = useState([]);
  const [loadingAct, setLoadingAct]     = useState(true);
  const [errorAct, setErrorAct]         = useState(null);

  /* ── Avis ────────────────────────────────────────────────────── */
  const [avis, setAvis]                 = useState([]);
  const [noteMoyenne, setNoteMoyenne]   = useState(null);
  const [loadingAvis, setLoadingAvis]   = useState(true);
  const [errorAvis, setErrorAvis]       = useState(null);

  /* ── Formulaire avis ─────────────────────────────────────────── */
  const [formNote, setFormNote]         = useState(0);
  const [formCommentaire, setFormCommentaire] = useState('');
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState(null);

  /* ── Toast ───────────────────────────────────────────────────── */
  const [toast, setToast]               = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  /* ── Chargement destination ─────────────────────────────────── */
  useEffect(() => {
    setLoadingDest(true);
    setErrorDest(null);
    api.get(`/destinations/${id}`)
      .then((res) => setDestination(res.destination))
      .catch((err) => setErrorDest(err.message || 'Erreur de chargement.'))
      .finally(() => setLoadingDest(false));
  }, [id]);

  /* ── Météo via Open-Meteo (fetch direct, pas le client api) ── */
  useEffect(() => {
    if (!destination?.latitude || !destination?.longitude) return;
    const lat = parseFloat(destination.latitude);
    const lon = parseFloat(destination.longitude);
    if (isNaN(lat) || isNaN(lon)) return;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
          });
        }
      })
      .catch(() => {
        /* widget météo muet en cas d'erreur réseau */
      });
  }, [destination]);

  /* ── Climat par saison via Open-Meteo Archive (année écoulée) ── */
  useEffect(() => {
    if (!destination?.latitude || !destination?.longitude) return;
    const lat = parseFloat(destination.latitude);
    const lon = parseFloat(destination.longitude);
    if (isNaN(lat) || isNaN(lon)) return;

    const Y = 2024; // dernière année complète
    fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${Y}-01-01&end_date=${Y}-12-31&daily=temperature_2m_max,temperature_2m_min&timezone=auto`)
      .then((r) => r.json())
      .then((data) => {
        const t = data?.daily?.time || [];
        const mx = data?.daily?.temperature_2m_max || [];
        const mn = data?.daily?.temperature_2m_min || [];
        if (!t.length) return;
        const tranches = [
          { label: 'Déc – Fév', months: [12, 1, 2] },
          { label: 'Mar – Mai', months: [3, 4, 5] },
          { label: 'Juin – Août', months: [6, 7, 8] },
          { label: 'Sep – Nov', months: [9, 10, 11] },
        ];
        const res = tranches.map((tr) => {
          let sMax = 0, sMin = 0, n = 0;
          t.forEach((d, i) => {
            const m = parseInt(d.slice(5, 7), 10);
            if (tr.months.includes(m) && mx[i] != null && mn[i] != null) {
              sMax += mx[i]; sMin += mn[i]; n++;
            }
          });
          return { label: tr.label, max: n ? Math.round(sMax / n) : null, min: n ? Math.round(sMin / n) : null };
        });
        setClimat(res);
      })
      .catch(() => {});
  }, [destination]);

  /* ── Hébergements ───────────────────────────────────────────── */
  useEffect(() => {
    setLoadingHeb(true);
    setErrorHeb(null);
    api.get('/hebergements', { id_destination: id, statut: 'disponible' })
      .then((res) => setHebergements(res.hebergements || []))
      .catch(() => {
        setHebergements([]);
        setErrorHeb(null); // route peut ne pas encore exister
      })
      .finally(() => setLoadingHeb(false));
  }, [id]);

  /* ── Activités ──────────────────────────────────────────────── */
  useEffect(() => {
    setLoadingAct(true);
    setErrorAct(null);
    api.get('/activites', { id_destination: id })
      .then((res) => setActivites(res.activites || []))
      .catch(() => {
        setActivites([]);
        setErrorAct(null);
      })
      .finally(() => setLoadingAct(false));
  }, [id]);

  /* ── Avis ────────────────────────────────────────────────────── */
  const fetchAvis = useCallback(() => {
    setLoadingAvis(true);
    setErrorAvis(null);
    api.get('/avis', { type_cible: 'destination', id_cible: id })
      .then((res) => {
        setAvis(res.avis || []);
        setNoteMoyenne(res.note_moyenne);
      })
      .catch((err) => setErrorAvis(err.message || 'Erreur lors du chargement des avis.'))
      .finally(() => setLoadingAvis(false));
  }, [id]);

  useEffect(() => { fetchAvis(); }, [fetchAvis]);

  /* ── Ajouter à l'itinéraire ─────────────────────────────────── */
  const handleAddToItineraire = useCallback(async () => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    try {
      const pRes = await api.get('/voyages/panier');
      const idVoyage = pRes?.voyage?.id_voyage;
      if (!idVoyage) {
        showToast('Impossible de récupérer le panier.');
        return;
      }
      await api.post(`/voyages/${idVoyage}/etapes`, { id_destination: parseInt(id, 10) });
      showToast('Destination ajoutée à votre itinéraire !');
    } catch (err) {
      showToast(err.message || 'Erreur lors de l\'ajout.');
    }
  }, [user, id, navigate, showToast]);

  /* ── Soumettre un avis ──────────────────────────────────────── */
  const handleSubmitAvis = useCallback(async (e) => {
    e.preventDefault();
    setFormError(null);

    if (formNote < 1 || formNote > 5) {
      setFormError('Veuillez sélectionner une note de 1 à 5.');
      return;
    }
    if (!formCommentaire.trim()) {
      setFormError('Veuillez écrire un commentaire.');
      return;
    }

    setFormLoading(true);
    try {
      await api.post('/avis', {
        note: formNote,
        commentaire: formCommentaire.trim(),
        type_cible: 'destination',
        id_destination: parseInt(id, 10),
      });
      setFormNote(0);
      setFormCommentaire('');
      showToast('Votre avis a été publié !');
      fetchAvis();
    } catch (err) {
      setFormError(err.message || 'Erreur lors de la publication de l\'avis.');
    } finally {
      setFormLoading(false);
    }
  }, [formNote, formCommentaire, id, showToast, fetchAvis]);

  /* ── Supprimer un avis ──────────────────────────────────────── */
  const handleDeleteAvis = useCallback(async (idAvis) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await api.del(`/avis/${idAvis}`);
      showToast('Avis supprimé.');
      fetchAvis();
    } catch (err) {
      showToast(err.message || 'Erreur lors de la suppression.');
    }
  }, [showToast, fetchAvis]);

  /* ── Rendu ───────────────────────────────────────────────────── */
  if (loadingDest) {
    return (
      <div className="detail-page page">
        <div className="container flex-center" style={{ minHeight: '60vh' }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (errorDest || !destination) {
    return (
      <div className="detail-page page">
        <div className="container section">
          <p className="detail-error">
            {errorDest || 'Destination introuvable.'}
          </p>
          <button className="btn btn--white mt-16" onClick={() => navigate('/destinations')}>
            ← Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  const [wLabel] = weather ? weatherLabel(weather.code) : [null];

  return (
    <div className="detail-page page">
      <div className="container">

        {/* ── Hero : illustration + carte ───────────────────── */}
        <div className="detail-inner">

          {/* Gauche : illustration / photo */}
          <div className="detail-illustration">
            {destination.photo_url
              ? <img src={destination.photo_url} alt={destination.nom} className="detail-hero-img" />
              : <div className="detail-illustration-placeholder" />
            }
          </div>

          {/* Droite : carte sombre */}
          <div className="detail-card">

            {/* Titre géant */}
            <h1 className="detail-title">{destination.nom}</h1>

            {/* Badge pays */}
            <div>
              <span className="detail-pays-badge">{destination.pays}</span>
              {destination.continent && (
                <span className="detail-pays-badge" style={{ marginLeft: 8 }}>
                  {destination.continent}
                </span>
              )}
            </div>

            {/* Description riche */}
            <p className="detail-description">{destination.description_longue || destination.description}</p>

            {/* Meilleure période */}
            {destination.meilleure_periode && (
              <p className="detail-period">
                <span className="detail-period__label">Meilleure période</span>
                {destination.meilleure_periode}
              </p>
            )}

            {/* Widget météo (bonus) */}
            {weather && (
              <div className="detail-weather">
                <span>Météo : {weather.temp}°C · {wLabel}</span>
              </div>
            )}

            {/* Note moyenne */}
            {noteMoyenne !== null && (
              <div className="detail-note-moyenne">
                <StarRating note={noteMoyenne} size="1.1rem" />
                <span>{noteMoyenne}/5</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                  ({avis.length} avis)
                </span>
              </div>
            )}

            {/* Catégorie comme tag */}
            {destination.categorie && (
              <div className="detail-tags">
                <span className="detail-tag">{destination.categorie}</span>
              </div>
            )}

            <hr className="detail-divider" />

            {/* Boutons d'action */}
            <div className="detail-actions">
              <button className="btn" onClick={handleAddToItineraire}>
                Ajouter à mon itinéraire
              </button>
              <a
                className="btn--outline-white"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.nom + ' ' + destination.pays)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir sur la carte
              </a>
            </div>
          </div>
        </div>

        {/* ── Sections : hébergements + activités + avis ────── */}
        <div className="detail-sections">

          {/* Climat par saison */}
          {climat.length > 0 && (
            <div className="detail-climate">
              <h2 className="detail-section-title">Climat au fil de l'année</h2>
              <div className="climate-grid">
                {climat.map((c) => (
                  <div key={c.label} className="climate-card">
                    <div className="climate-card__season">{c.label}</div>
                    <div className="climate-card__temp">{c.min}° – {c.max}°C</div>
                    <div className="climate-card__label">{climatLabel(c.max)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* À ne pas manquer */}
          {destination.points_forts && (
            <div className="detail-highlights">
              <h2 className="detail-section-title">À ne pas manquer</h2>
              <div className="highlight-list">
                {destination.points_forts.split('|').map((p, i) => (
                  <span key={i} className="highlight-chip">{p.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Hébergements + Activités (côte à côte si place) */}
          <div className="grid grid-2" style={{ marginBottom: 48 }}>

            {/* Hébergements disponibles */}
            <div>
              <h2 className="detail-section-title">Hébergements disponibles</h2>
              {loadingHeb
                ? <Loader />
                : errorHeb
                  ? <p className="detail-error">{errorHeb}</p>
                  : hebergements.length === 0
                    ? <p className="detail-empty">Aucun hébergement disponible pour le moment.</p>
                    : (
                      <div className="detail-scroll-row">
                        {hebergements.map((h) => (
                          <HebergementCard key={h.id_hebergement} h={h} />
                        ))}
                      </div>
                    )
              }
            </div>

            {/* Activités */}
            <div>
              <h2 className="detail-section-title">Activités</h2>
              {loadingAct
                ? <Loader />
                : errorAct
                  ? <p className="detail-error">{errorAct}</p>
                  : activites.length === 0
                    ? <p className="detail-empty">Aucune activité disponible pour le moment.</p>
                    : (
                      <div className="detail-scroll-row">
                        {activites.map((a) => (
                          <ActiviteCard key={a.id_activite} a={a} />
                        ))}
                      </div>
                    )
              }
            </div>
          </div>

          {/* ── Avis ─────────────────────────────────────────── */}
          <div>
            <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 8 }}>
              <h2 className="detail-section-title" style={{ marginBottom: 0 }}>
                Avis
              </h2>
              {noteMoyenne !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating note={noteMoyenne} size="1.1rem" />
                  <strong style={{ fontFamily: 'var(--font-display)' }}>
                    {noteMoyenne}/5
                  </strong>
                  <span className="muted">({avis.length} avis)</span>
                </div>
              )}
            </div>

            {/* Liste des avis */}
            {loadingAvis
              ? <Loader />
              : errorAvis
                ? <p className="detail-error">{errorAvis}</p>
                : avis.length === 0
                  ? <p className="detail-empty">Aucun avis pour cette destination. Soyez le premier !</p>
                  : (
                    <div className="avis-list">
                      {avis.map((av) => (
                        <div key={av.id_avis} className="avis-item">
                          <div className="avis-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="avis-auteur">
                                {av.auteur_prenom} {av.auteur_nom}
                              </span>
                              <StarRating note={av.note} size="0.95rem" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="avis-date">
                                {new Date(av.date_avis).toLocaleDateString('fr-FR')}
                              </span>
                              {user && (user.id_utilisateur === av.id_utilisateur || user.role === 'admin') && (
                                <button
                                  className="avis-delete-btn"
                                  onClick={() => handleDeleteAvis(av.id_avis)}
                                  title="Supprimer cet avis"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="avis-commentaire">{av.commentaire}</p>
                        </div>
                      ))}
                    </div>
                  )
            }

            {/* Formulaire pour ajouter un avis */}
            {user
              ? (
                <div className="avis-form mt-24">
                  <h3 className="avis-form-title">Laisser un avis</h3>
                  <form onSubmit={handleSubmitAvis}>
                    <div className="field">
                      <label>Note</label>
                      <StarSelector value={formNote} onChange={setFormNote} />
                    </div>
                    <div className="field">
                      <label htmlFor="avis-commentaire">Commentaire</label>
                      <textarea
                        id="avis-commentaire"
                        className="textarea"
                        placeholder="Partagez votre expérience..."
                        value={formCommentaire}
                        onChange={(e) => setFormCommentaire(e.target.value)}
                        rows={4}
                      />
                    </div>
                    {formError && <p className="detail-error mb-8">{formError}</p>}
                    <button
                      type="submit"
                      className="btn btn--lime"
                      disabled={formLoading}
                    >
                      {formLoading ? 'Publication...' : 'Publier l\'avis'}
                    </button>
                  </form>
                </div>
              )
              : (
                <div className="mt-24" style={{
                  background: 'rgba(255,255,255,0.5)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  border: '2px solid rgba(0,0,0,0.1)'
                }}>
                  <p style={{ marginBottom: 12 }}>
                    Connectez-vous pour laisser un avis sur cette destination.
                  </p>
                  <button
                    className="btn btn--white"
                    onClick={() => navigate('/connexion')}
                  >
                    Se connecter
                  </button>
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Toast de confirmation */}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
