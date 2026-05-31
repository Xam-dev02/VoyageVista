/**
 * Thème par page : couleur de fond (pour la Navbar) + image de fond générée.
 * `dark: true` => texte/logo de la navbar en clair.
 * `img` => nom du fichier dans /public (sans extension) appliqué en fond de page.
 */
const THEMES = {
  '/':              { bg: '#FD6357', dark: false, img: null },              // Home gère son propre hero
  '/connexion':     { bg: '#051175', dark: true,  img: 'connexion-bg' },
  '/destinations':  { bg: '#F86543', dark: false, img: null },           // hero dédié dans la page
  '/hebergements':  { bg: '#02CDAF', dark: false, img: 'hebergements-bg' },
  '/activites':     { bg: '#DA3B75', dark: false, img: 'activites-bg' },
  '/transports':    { bg: '#C1F703', dark: false, img: 'transport-bg' },
  '/itineraire':    { bg: '#FCB92A', dark: false, img: 'itineraire-bg' },
  '/panier':        { bg: '#C1D22E', dark: false, img: 'panier-bg' },
  '/profil':        { bg: '#832FE7', dark: true,  img: 'profil-bg' },
  '/notifications': { bg: '#52B9FB', dark: false, img: 'notifications-bg' },
  '/favoris':       { bg: '#FF4D8D', dark: true,  img: null },
  '/admin':         { bg: '#121212', dark: true,  img: 'admin-bg' },
  '/prestataire':   { bg: '#752EF4', dark: true,  img: 'prestataire-bg' },
};

function entry(pathname) {
  if (pathname.startsWith('/destinations/')) return { bg: '#56BEFD', dark: false, img: 'detail-bg' };
  return THEMES[pathname] || { bg: 'var(--cream)', dark: false, img: null };
}

export function getTheme(pathname) {
  const e = entry(pathname);
  return { bg: e.bg, dark: e.dark };
}

/** Style de fond de page (image générée) appliqué sur <main>, ou null. */
export function getPageBackgroundStyle(pathname) {
  const e = entry(pathname);
  if (!e.img) return null;
  return {
    backgroundColor: e.bg,
    backgroundImage: `url(/${e.img}.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    // `fixed` => le `cover` est calculé par rapport à la fenêtre et non à la
    // hauteur totale de la page : les fonds des pages longues (hébergements,
    // activités…) ne sont plus agrandis/zoomés.
    backgroundAttachment: 'fixed',
  };
}
