import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/ui';
import './Auth.css';

export default function Auth() {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // mode: 'connexion' | 'inscription'
  const [mode, setMode] = useState('connexion');

  // Champs connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMdp, setLoginMdp] = useState('');

  // Champs inscription
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMdp, setRegMdp] = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole] = useState('voyageur');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect destination helper
  const redirectByRole = (u) => {
    const from = location.state?.from;
    if (from) { navigate(from, { replace: true }); return; }
    if (u.role === 'admin') navigate('/admin', { replace: true });
    else if (u.role === 'prestataire') navigate('/prestataire', { replace: true });
    else navigate('/destinations', { replace: true });
  };

  // Already logged in — redirect immediately
  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <div className="auth-page"><Loader /></div>;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const u = await login(loginEmail, loginMdp);
      redirectByRole(u);
    } catch (err) {
      setError(err.message || 'Erreur de connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { nom, prenom, email: regEmail, mot_de_passe: regMdp, role };
      if (telephone.trim()) payload.telephone = telephone.trim();
      const u = await register(payload);
      redirectByRole(u);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout container">
        {/* Colonne gauche — laissée vide : l'illustration vient du fond de page généré */}
        <div className="auth-illustration" aria-hidden="true" />

        {/* Carte sombre */}
        <div className="auth-card card-dark">
          <h1 className="display-lg auth-card__title">
            {mode === 'connexion' ? 'CONNEXION' : 'INSCRIPTION'}
          </h1>

          {/* Toggle mode */}
          <div className="auth-toggle">
            <button
              type="button"
              className={`pill${mode === 'connexion' ? ' pill--active' : ''}`}
              onClick={() => { setMode('connexion'); setError(''); }}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`pill${mode === 'inscription' ? ' pill--active' : ''}`}
              onClick={() => { setMode('inscription'); setError(''); }}
            >
              Inscription
            </button>
          </div>

          {/* Erreur serveur */}
          {error && <p className="auth-error">{error}</p>}

          {/* ---- Formulaire Connexion ---- */}
          {mode === 'connexion' && (
            <form onSubmit={handleLogin} noValidate>
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="input"
                  placeholder="votre@email.fr"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <label htmlFor="login-mdp">Mot de passe</label>
                <input
                  id="login-mdp"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={loginMdp}
                  onChange={e => setLoginMdp(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="btn btn--coral btn--block btn--lg mt-8"
                disabled={submitting}
              >
                {submitting ? 'Connexion…' : 'Se connecter'}
              </button>
              <p className="auth-switch">
                Pas encore de compte ?{' '}
                <button type="button" className="auth-switch__link" onClick={() => { setMode('inscription'); setError(''); }}>
                  Créer un compte
                </button>
              </p>
            </form>
          )}

          {/* ---- Formulaire Inscription ---- */}
          {mode === 'inscription' && (
            <form onSubmit={handleRegister} noValidate>
              <div className="auth-row">
                <div className="field">
                  <label htmlFor="reg-prenom">Prénom</label>
                  <input
                    id="reg-prenom"
                    type="text"
                    className="input"
                    placeholder="Sophie"
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="field">
                  <label htmlFor="reg-nom">Nom</label>
                  <input
                    id="reg-nom"
                    type="text"
                    className="input"
                    placeholder="Martin"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  className="input"
                  placeholder="votre@email.fr"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <label htmlFor="reg-mdp">Mot de passe</label>
                <input
                  id="reg-mdp"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={regMdp}
                  onChange={e => setRegMdp(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="field">
                <label htmlFor="reg-tel">Téléphone <span className="auth-optional">(optionnel)</span></label>
                <input
                  id="reg-tel"
                  type="tel"
                  className="input"
                  placeholder="+33 6 00 00 00 00"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  autoComplete="tel"
                />
              </div>

              {/* Role toggle */}
              <div className="field">
                <label>Je suis…</label>
                <div className="auth-role-toggle">
                  <button
                    type="button"
                    className={`pill${role === 'voyageur' ? ' pill--active' : ''}`}
                    onClick={() => setRole('voyageur')}
                  >
                    Voyageur
                  </button>
                  <button
                    type="button"
                    className={`pill${role === 'prestataire' ? ' pill--active' : ''}`}
                    onClick={() => setRole('prestataire')}
                  >
                    Prestataire
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--coral btn--block btn--lg mt-8"
                disabled={submitting}
              >
                {submitting ? 'Création…' : 'Créer mon compte'}
              </button>
              <p className="auth-switch">
                Déjà un compte ?{' '}
                <button type="button" className="auth-switch__link" onClick={() => { setMode('connexion'); setError(''); }}>
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
