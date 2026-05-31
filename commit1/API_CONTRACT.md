# VoyageVista — Contrat d'API (référence partagée)

Toutes les routes sont préfixées par `/api`. Le front (Vite) proxifie `/api` vers le
serveur PHP (`http://localhost:8000`). Authentification par **session PHP** (cookie),
le client envoie `credentials:'include'` automatiquement via `src/services/api.js`.

> **Règle d'or pour les agents** : implémente le fichier de route PHP qui t'est assigné
> en respectant EXACTEMENT les chemins/réponses ci-dessous, et **consomme** les autres
> ressources via `api.get/post/put/del` selon ce même contrat. Ne modifie jamais
> `index.php`, `main.jsx`, ni les fichiers `lib/` ou `config/`.

Format d'erreur standard : `{ "error": "message" }` avec le bon code HTTP.

---

## Tables (rappel schéma)
`utilisateur, destination, hebergement, transport, activite, voyage, etape,
etape_activite, reservation, notification, avis`
(voir `database/schema.sql`). Le **panier** = un `voyage` de l'utilisateur avec
`statut='brouillon'`. La **réservation** confirme un voyage.

---

## auth.php  *(déjà implémenté — modèle de référence)*
| Méthode | Chemin | Corps | Réponse |
|---|---|---|---|
| POST | `/auth/register` | `{nom,prenom,email,mot_de_passe,role?,telephone?}` | `{user}` 201 |
| POST | `/auth/login` | `{email,mot_de_passe}` | `{user}` |
| POST | `/auth/logout` | — | `{message}` |
| GET  | `/auth/me` | — | `{user}` ou `{user:null}` |

`user = {id_utilisateur, nom, prenom, email, role}`

---

## destinations.php  *(agent Catalogue)*
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/destinations` | params: `q` (recherche nom/pays), `categorie`, `tri` (`nom`,`pays`). Renvoie `{destinations:[...]}` |
| GET | `/destinations/:id` | détail + `note_moyenne` + `nb_avis`. Renvoie `{destination}` |
| POST | `/destinations` | (admin/prestataire) crée. Renvoie `{destination}` 201 |
| PUT | `/destinations/:id` | (admin/prestataire) modifie |
| DELETE | `/destinations/:id` | (admin) supprime |

Objet `destination = {id_destination, nom, pays, continent, description, latitude, longitude, photo_url, categorie}`

---

## hebergements.php  *(agent Hébergements)*
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/hebergements` | params: `id_destination`, `type`, `etoiles_min`, `prix_max`, `q`, `statut`. `{hebergements:[...]}` |
| GET | `/hebergements/:id` | `{hebergement}` (+ avis, note_moyenne) |
| POST | `/hebergements` | (prestataire/admin) — `statut` par défaut `en_attente` |
| PUT | `/hebergements/:id` | modifie (propriétaire ou admin) |
| DELETE | `/hebergements/:id` | supprime (propriétaire ou admin) |

`hebergement = {id_hebergement, nom, type, etoiles, prix_nuit, capacite, description, adresse, equipements, photo_url, statut, id_destination, id_prestataire}`

---

## transports.php  *(agent Transports)*
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/transports` | params: `id_origine`, `id_arrivee`, `type`, `date` (YYYY-MM-DD), `tri` (`prix`,`duree`,`depart`). `{transports:[...]}` |
| GET | `/transports/:id` | `{transport}` |
| POST | `/transports` | (prestataire/admin) — **refuse** si `date_arrivee <= date_depart` (422) |
| PUT | `/transports/:id` | modifie |
| DELETE | `/transports/:id` | supprime |

Inclure `places_disponibles`. Un transport avec 0 place = affiché « Complet » côté front.
`transport = {id_transport, type, compagnie, numero, date_depart, date_arrivee, classe, prix, places_totales, places_disponibles, id_origine, id_arrivee, nom_origine, nom_arrivee}`

---

## activites.php  *(agent Activités)*
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/activites` | params: `id_destination`, `type`, `prix_max`, `q`. `{activites:[...]}` |
| GET | `/activites/:id` | `{activite}` |
| POST | `/activites` | (prestataire/admin) |
| PUT | `/activites/:id` | modifie |
| DELETE | `/activites/:id` | supprime |

`activite = {id_activite, nom, description, type, prix_personne, duree_heures, capacite_max, places_disponibles, photo_url, statut, id_destination, id_prestataire}`

---

## voyages.php  *(agent Itinéraire)* — itinéraire + panier
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/voyages` | (connecté) voyages de l'utilisateur. `{voyages:[...]}` |
| GET | `/voyages/panier` | le voyage `brouillon` courant (créé si absent), avec `etapes` détaillées. `{voyage}` |
| GET | `/voyages/:id` | détail complet (étapes, hébergements, transports, activités, prix_total). `{voyage}` |
| POST | `/voyages` | crée un voyage `{titre, nb_voyageurs}`. `{voyage}` 201 |
| PUT | `/voyages/:id` | modifie titre/nb_voyageurs |
| DELETE | `/voyages/:id` | supprime l'itinéraire |
| POST | `/voyages/:id/etapes` | ajoute une étape `{id_destination, ordre?, date_arrivee?, date_depart?}` |
| PUT | `/voyages/etapes/:idEtape` | associe transport/hébergement `{id_transport?, id_hebergement?, dates?}` |
| DELETE | `/voyages/etapes/:idEtape` | retire l'étape |
| POST | `/voyages/etapes/:idEtape/activites` | ajoute activité `{id_activite, nb_personnes, date_heure?}` |
| DELETE | `/voyages/activites/:idEtapeActivite` | retire activité |

Le `prix_total` est **recalculé côté serveur** à chaque modif (transports + hébergements×nuits + activités×personnes) et stocké dans `voyage.prix_total`.
Objet voyage détaillé : `{id_voyage, titre, statut, nb_voyageurs, prix_total, etapes:[{id_etape, ordre, destination:{...}, hebergement:{...}|null, transport:{...}|null, activites:[{...}], nuits}]}`

---

## reservations.php  *(agent Panier)* — validation, paiement, gestion
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/reservations` | (connecté) `{reservations:[...]}` |
| GET | `/reservations/:id` | `{reservation}` |
| POST | `/reservations` | confirme un voyage `{id_voyage, methode_paiement, infos_paiement:{titulaire,numero,expiration,cvv}}`. Génère `reference` (VV-2026-XXXXXX), passe le voyage en `confirme`, **crée une notification**, décrémente les places. `{reservation}` 201 |
| PUT | `/reservations/:id` | modifie (ex: méthode) |
| DELETE | `/reservations/:id` | annule (statut `annulee`, voyage `annule`, notification) |

Contrôles avant validation : voyage non vide, places dispo suffisantes → sinon 422.

---

## notifications.php  *(agent Notifications)*
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/notifications` | (connecté) `{notifications:[...], non_lues: n}` |
| PUT | `/notifications/:id` | marque comme lue `{est_lue:true}` |
| PUT | `/notifications` | marque tout comme lu |
| DELETE | `/notifications/:id` | supprime |
| POST | `/notifications` | (interne/admin) crée `{id_utilisateur,titre,message,type,id_voyage?}` |

> Fonction utilitaire conseillée à exposer pour les autres routes :
> insérer une notification après réservation/modification.

---

## users.php  *(agent Profil)*
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/users/me` | profil complet du connecté (sans mot de passe). `{user}` |
| PUT | `/users/me` | modifie `{nom,prenom,telephone,photo_profil,mot_de_passe?}`. `{user}` |
| GET | `/users` | (admin) liste tous les utilisateurs. `{users:[...]}` |

---

## admin.php  *(agent Dashboard Admin)*
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/admin/stats` | `{utilisateurs, offres_actives, reservations, en_attente}` |
| GET | `/admin/offres_attente` | hébergements/activités/transports `statut='en_attente'`. `{offres:[...]}` (champ `categorie_offre`: heberg/activite) |
| PUT | `/admin/offres/:type/:id` | valide/rejette `{statut:'disponible'|'rejete'}` (type = `hebergement`|`activite`) |
| GET | `/admin/utilisateurs` | `{users:[...]}` |
| PUT | `/admin/utilisateurs/:id/role` | change le rôle `{role}` (ajout/retrait admin) |
| PUT | `/admin/utilisateurs/:id/statut` | active/désactive `{statut}` |
| DELETE | `/admin/utilisateurs/:id` | supprime un utilisateur |

Toutes les routes admin → `Auth::requireRole('admin')`.

---

## avis.php  *(agent Détail destination — bonus)*
| Méthode | Chemin | Détail |
|---|---|---|
| GET | `/avis` | params: `type_cible`, `id_cible`. `{avis:[...], note_moyenne}` |
| POST | `/avis` | (connecté) `{note,commentaire,type_cible,id_hebergement?/id_activite?/id_destination?}` |
| DELETE | `/avis/:id` | (auteur ou admin) |

---

## Conventions PHP (toutes les routes)
```php
<?php
// $method, $id, $segments fournis par index.php
// Helpers dispo : db(), body(), require_fields(), Response::*, Auth::*
switch ($method) {
  case 'GET':    /* ... */ break;
  case 'POST':   $data = body(); /* ... */ break;
  case 'PUT':    /* ... */ break;
  case 'DELETE': /* ... */ break;
  default: Response::error('Méthode non supportée', 405);
}
```
- Toujours utiliser des **requêtes préparées** (sécurité injection SQL).
- Vérifier les droits avec `Auth::requireLogin()` / `Auth::requireRole(...)`.
- Répondre via `Response::ok()/created()/error()`.
