import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protège une route. Redirige vers /connexion si non connecté.
 * `roles` (optionnel) limite l'accès à certains rôles.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
