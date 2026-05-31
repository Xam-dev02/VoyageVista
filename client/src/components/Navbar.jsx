import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getTheme } from '../theme';
import './Navbar.css';

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const theme = getTheme(pathname);
  const [nonLues, setNonLues] = useState(0);

  useEffect(() => {
    if (!user) { setNonLues(0); return; }
    const fetch = () => api.get('/notifications').then(d => setNonLues(d.non_lues || 0)).catch(() => {});
    fetch();
    const timer = setInterval(fetch, 30000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <header className={`nav${theme.dark ? ' nav--dark' : ''}`} style={{ background: theme.bg }}>
      <div className="container nav__inner">
        <NavLink to="/" className="nav__logo-link" aria-label="Accueil VoyageVista">
          <img className="nav__logo-img" src="/logo.png" alt="VoyageVista" />
        </NavLink>

        <nav className="nav__capsule">
          <NavLink to="/destinations" className="nav__link">Destinations</NavLink>
          <NavLink to="/transports"   className="nav__link">Transports</NavLink>
          <NavLink to="/hebergements" className="nav__link">Hébergements</NavLink>
          <NavLink to="/activites"    className="nav__link">Activités</NavLink>
          {user && user.role !== 'prestataire' && user.role !== 'admin' && <NavLink to="/itineraire" className="nav__link">Itinéraire</NavLink>}
        </nav>

        <div className="nav__actions">
          {user ? (
            <>
              {user.role === 'admin' && <NavLink to="/admin" className="nav__cta">Admin</NavLink>}
              {user.role === 'prestataire' && <NavLink to="/prestataire" className="nav__cta">Mon espace</NavLink>}
              <NavLink to="/notifications" className="nav__cta nav__notif">
                Notifications
                {nonLues > 0 && <span className="nav__badge">{nonLues}</span>}
              </NavLink>
              {user.role === 'voyageur' && <NavLink to="/favoris" className="nav__cta nav__cta--heart" title="Mes favoris" aria-label="Mes favoris">♥</NavLink>}
              {user.role === 'voyageur' && <NavLink to="/panier" className="nav__cta">Panier</NavLink>}
              <NavLink to="/profil" className="nav__cta nav__cta--solid">{user.prenom}</NavLink>
            </>
          ) : (
            <NavLink to="/connexion" className="nav__cta nav__cta--solid">Se connecter</NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
