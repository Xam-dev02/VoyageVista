# Brief partagé — agents "1 page par agent" VoyageVista

Tu construis **UNE seule page** de VoyageVista, une plateforme de planification de voyages
(projet scolaire ECE ING2). Stack : **React (Vite) + PHP + MySQL**, client/serveur séparés.

**RACINE DU PROJET** : `/Users/maxencemermet/Ecole/Projets/projet-piscine/02_developpement/voyagevista`

## À LIRE EN PREMIER (obligatoire)
1. `API_CONTRACT.md` — endpoints exacts & formes de réponse (le contrat partagé)
2. `DESIGN_GUIDE.md` — style visuel, classes CSS, composants partagés à utiliser
3. `api/routes/auth.php` — LE modèle de référence pour écrire une route PHP
4. Ton image de wireframe (chemin donné dans ta tâche) — reproduis sa mise en page/couleurs au plus près
5. `client/src/components/ui.jsx`, `Navbar.jsx` — composants partagés disponibles

## L'ENVIRONNEMENT TOURNE DÉJÀ (teste dessus)
- **MySQL** sur `127.0.0.1:8889` (root/root), base `voyagevista`, déjà remplie.
  CLI : `/Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -proot -h 127.0.0.1 -P 8889 voyagevista`
- **API PHP** sur `http://localhost:8000` — ajouter un fichier `api/routes/X.php` le rend
  immédiatement accessible sur `/api/X` (aucun redémarrage). Teste avec `curl`.
- **Comptes démo** (mot de passe = `password123`) :
  `sophie.martin@email.fr` (voyageur), `admin@voyagevista.fr` (admin), `contact@nakamura-hotels.jp` (prestataire).
- Tester une route authentifiée (utilise un nom de cookie UNIQUE pour éviter les collisions) :
  ```bash
  curl -s -c /tmp/ck_TONNOM.txt -X POST http://localhost:8000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"sophie.martin@email.fr","mot_de_passe":"password123"}'
  curl -s -b /tmp/ck_TONNOM.txt http://localhost:8000/api/...
  ```

## RÈGLES STRICTES
- N'écris QUE les fichiers listés dans TA TÂCHE.
- NE MODIFIE PAS (tu peux LIRE) : `api/index.php`, `api/lib/*`, `api/config/*`, `api/routes/auth.php`,
  `client/src/main.jsx`, `client/src/index.css`, `client/src/components/*`, `client/src/context/*`, `client/src/services/*`.
- Ne touche PAS aux pages/routes des autres agents.
- **N'exécute PAS** `npm run build`, `npm run dev` ni `vite` (les builds parallèles entrent en conflit ;
  l'intégration est centralisée). Tu PEUX tester le PHP avec `curl` autant que tu veux.
- **Tout le texte de l'interface en FRANÇAIS.** Utilise les classes CSS et composants du DESIGN_GUIDE
  (ne réinvente pas la navbar/footer — ils sont globaux).
- **PHP** : requêtes préparées (PDO via `db()`), gardes `Auth::`, helpers `Response::` — calque sur `auth.php`.
  `$method`, `$id`, `$segments` sont fournis par `index.php`.
- **React imports** : `import api from '../services/api'` · `import { useAuth } from '../context/AuthContext'`
  · `import { Loader, StatusBadge, StarRating, euros } from '../components/ui'`.
- Gère les états : chargement (`<Loader/>`), vide, et erreurs.
- Mets le CSS spécifique de ta page dans `pages/TaPage.css` et importe-le dans ton `.jsx`.

## RAPPORT FINAL (< 150 mots)
Liste : fichiers créés, endpoints implémentés, ce que tu as testé en curl + résultat, hypothèses prises.
