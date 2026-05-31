import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section text-center">
      <div className="display-xl">404</div>
      <p className="muted mb-24">Cette page n'existe pas (encore).</p>
      <Link to="/" className="btn">Retour à l'accueil</Link>
    </div>
  );
}
