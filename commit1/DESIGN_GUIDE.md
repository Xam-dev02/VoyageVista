# VoyageVista — Guide de design (pour tous les agents)

Style : **éditorial flat & vibrant** inspiré de bar.digital (voir les wireframes dans
`01_conception/wireframes/generated/`). Chaque page a **un fond de couleur pleine et vive**,
une **police d'affichage géométrique** (Space Grotesk) pour les gros titres, des **pills**
arrondies, et des **cartes sombres `#1A1A1A`** qui se superposent au fond. **Pas de dégradés.**

## Police & titres
- Titres géants : classes `.display-xl`, `.display-lg`, `.display-md` (déjà en Space Grotesk).
- Corps de texte : Inter (par défaut).

## Couleur de fond par page (à mettre sur le conteneur racine de la page)
| Page | Classe fond |
|---|---|
| Landing | sections alternées (`.bg-pink`, `.bg-sky`, `.bg-lime`, `.bg-dark`) |
| Connexion | `.bg-dark` (carte) sur fond `--sky` ou navy |
| Catalogue destinations | `.bg-coral` |
| Détail destination | `.bg-sky` |
| Itinéraire | `.bg-gold` |
| Transports | `.bg-lime` |
| Hébergements | `.bg-teal` |
| Activités | `.bg-rose` |
| Panier | `.bg-lime` (carte sombre) |
| Profil | `.bg-violet` |
| Notifications | `.bg-sky` |
| Dashboard Admin | `.bg-black` (near-black) |
| Dashboard Prestataire | `.bg-violet` |

## Composants & classes prêts à l'emploi (dans `index.css` et `components/`)
- **Boutons** : `.btn`, `.btn--white`, `.btn--lime`, `.btn--pink`, `.btn--outline`, `.btn--block`, `.btn--lg`
- **Pills** : `.pill`, `.pill--active`, `.pill--sm`, `.pill--dark`, `.pill--ghost`
- **Badges statut** : composant `<StatusBadge statut="disponible" />` (depuis `components/ui.jsx`)
- **Cartes** : `.card` (claire, bord noir) / `.card-dark` (sombre)
- **Formulaires** : `.field` > `label` + `.input`/`.select`/`.textarea`
- **Layout** : `.container`, `.section`, `.grid .grid-2/3/4`, `.flex-between`, `.flex-col`, `.gap-16`...
- **UI** : `<Loader/>`, `<Toast message=.. onClose=../>`, `<StarRating note=4.5/>`, `euros(1250)` → "1 250 €"

Importer : `import { Loader, StatusBadge, StarRating, euros } from '../components/ui';`
Données : `import api from '../services/api';` puis `api.get('/destinations', {categorie:'plage'})`.
Auth : `import { useAuth } from '../context/AuthContext';` → `const { user } = useAuth();`

## Règles
- Tout le texte de l'interface est **en français**.
- Chaque page gère : état de chargement (`<Loader/>`), état vide, erreurs.
- Responsive : les classes grid passent en 1 colonne sur mobile automatiquement.
- Mets le CSS spécifique à ta page dans `pages/TaPage.css` et importe-le.
- Images de démo : les `photo_url` viennent de la BDD (Unsplash). Utilise-les dans les cartes.
