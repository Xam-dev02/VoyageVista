/**
 * Petits composants UI réutilisables, cohérents avec le design system.
 */

export function Loader() {
  return <div className="spinner" aria-label="Chargement" />;
}

export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="toast" onClick={onClose} role="status">{message}</div>
  );
}

/** Étoiles (1 à 5) pour les notes / avis. */
export function StarRating({ note = 0, size = '1rem' }) {
  return (
    <span style={{ fontSize: size, color: '#FFD23F', letterSpacing: 1 }}>
      {'★'.repeat(Math.round(note))}{'☆'.repeat(Math.max(0, 5 - Math.round(note)))}
    </span>
  );
}

/** Badge de statut générique (disponible / en_attente / complet / etc.). */
export function StatusBadge({ statut }) {
  const map = {
    disponible:  ['badge--success', 'Disponible'],
    confirme:    ['badge--success', 'Confirmé'],
    confirmee:   ['badge--success', 'Confirmée'],
    approuve:    ['badge--success', 'Approuvé'],
    actif:       ['badge--success', 'Actif'],
    en_attente:  ['badge--warning', 'En attente'],
    brouillon:   ['badge--warning', 'Brouillon'],
    complet:     ['badge--danger',  'Complet'],
    indisponible:['badge--danger',  'Indisponible'],
    annule:      ['badge--danger',  'Annulé'],
    annulee:     ['badge--danger',  'Annulée'],
    rejete:      ['badge--danger',  'Rejeté'],
    inactif:     ['badge--muted',   'Inactif'],
    termine:     ['badge--muted',   'Terminé'],
  };
  const [cls, label] = map[statut] || ['badge--muted', statut];
  return <span className={`badge ${cls}`}>{label}</span>;
}

/** Formate un prix en euros. */
export function euros(montant) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(montant ?? 0);
}
