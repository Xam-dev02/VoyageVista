# VoyageVista

Plateforme de planification de voyages et de séjours — Projet Web dynamique 2026, ECE ING2.

**Stack :** React (Vite) · PHP 8 · MySQL · architecture client–serveur séparée.

---

## Structure

```
voyagevista/
├── database/        Schéma + données de démo MySQL
│   ├── schema.sql
│   └── seed.sql
├── api/             Backend PHP (API REST, sessions)
│   ├── index.php        Front controller / routeur
│   ├── config/          Connexion BDD
│   ├── lib/             Response, Auth, helpers
│   └── routes/          1 fichier par ressource
├── client/          Frontend React (Vite)
│   ├── src/pages/       1 composant par page
│   ├── src/components/  Navbar, Footer, UI partagés
│   ├── src/context/     AuthContext
│   └── src/services/    Client API
├── API_CONTRACT.md  Spécification des endpoints
└── DESIGN_GUIDE.md  Charte graphique & composants
```

---

## Installation & lancement (développement)

### 1. Base de données
Démarrer MySQL (MAMP → *Start Servers*), puis importer :
```bash
MYSQL=/Applications/MAMP/Library/bin/mysql80/bin/mysql
$MYSQL -u root -proot -h 127.0.0.1 -P 8889 < database/schema.sql
$MYSQL -u root -proot -h 127.0.0.1 -P 8889 < database/seed.sql
```

### 2. API PHP (port 8000)
```bash
PHP=/Applications/MAMP/bin/php/php8.3.30/bin/php
$PHP -S localhost:8000 api/index.php
```

### 3. Frontend React (port 5173)
```bash
cd client
npm install
npm run dev
```
Ouvrir http://localhost:5173 — Vite proxifie `/api` vers le serveur PHP.

---

## Comptes de démonstration
Mot de passe commun : **`password123`**

| Rôle | E-mail |
|---|---|
| Admin | `admin@voyagevista.fr` |
| Voyageur | `sophie.martin@email.fr` |
| Prestataire | `contact@nakamura-hotels.jp` |

---

## Production (démo enseignants)
`cd client && npm run build` génère `client/dist/`. Servir `dist/` + `api/` via
Apache (MAMP) avec une règle de réécriture renvoyant `/api/*` vers `api/index.php`.
