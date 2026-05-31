import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTheme } from '../theme';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = getTheme(pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
          {user && <NavLink to="/itineraire" className="nav__link">Itinéraire</NavLink>}
        </nav>

        <div className="nav__actions">
          {user ? (
            <>
              {user.role === 'admin' && <NavLink to="/admin" className="nav__cta">Admin</NavLink>}
              {user.role === 'prestataire' && <NavLink to="/prestataire" className="nav__cta">Mon espace</NavLink>}
              <NavLink to="/notifications" className="nav__cta">Notifications</NavLink>
              <NavLink to="/panier" className="nav__cta">Panier</NavLink>
              <NavLink to="/profil" className="nav__cta nav__cta--solid">{user.prenom}</NavLink>
              <button onClick={handleLogout} className="nav__cta">Déconnexion</button>
            </>
          ) : (
            <NavLink to="/connexion" className="nav__cta nav__cta--solid">Se connecter</NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
