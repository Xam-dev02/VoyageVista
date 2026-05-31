import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <div className="footer__logo">VoyageVista</div>
          <p className="muted">Planifiez. Explorez. Vivez.</p>
        </div>
        <div className="footer__cols">
          <div>
            <h4>Explorer</h4>
            <a href="/destinations">Destinations</a>
            <a href="/transports">Transports</a>
            <a href="/hebergements">Hébergements</a>
            <a href="/activites">Activités</a>
          </div>
          <div>
            <h4>Compte</h4>
            <a href="/connexion">Connexion</a>
            <a href="/itineraire">Mon itinéraire</a>
            <a href="/panier">Mon panier</a>
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        © 2026 VoyageVista — Projet Web dynamique ECE ING2.
      </div>
    </footer>
  );
}
