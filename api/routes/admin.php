<?php
/**
 * Route ADMIN — /api/admin/...
 *
 * Toutes les routes exigent le rôle 'admin'.
 *
 * Endpoints :
 *   GET    /api/admin/stats
 *   GET    /api/admin/offres_attente
 *   PUT    /api/admin/offres/:type/:id          body { statut }
 *   GET    /api/admin/utilisateurs
 *   PUT    /api/admin/utilisateurs/:id/role     body { role }
 *   PUT    /api/admin/utilisateurs/:id/statut   body { statut }
 *   DELETE /api/admin/utilisateurs/:id
 *
 * Variables disponibles (fournies par index.php) : $method, $id, $segments
 * Rappel : après index.php, $resource='admin' a été consommé,
 *          $segments = reste du chemin (ex: ['stats'], ['offres','hebergement','5'])
 */

Auth::requireRole('admin');

// $segments ici : tout ce qui suit /api/admin/
// ex: /api/admin/stats            -> $segments = ['stats']
// ex: /api/admin/offres_attente   -> $segments = ['offres_attente']
// ex: /api/admin/offres/hebergement/5 -> $segments = ['offres', 'hebergement', '5']
//     (attention : index.php a déjà tenté de consommer $id si segments[0] était numérique)
// ex: /api/admin/utilisateurs/3/role -> $segments = ['utilisateurs','3','role']
//     (ici $id a pu être consommé si le 2e token est numérique)
//
// Pour reconstruire proprement, on reconstruit la clé d'action à partir
// du premier segment non-numérique et du $id résolu par index.php.

$action = $segments[0] ?? '';

switch ($method) {

    // ================================================================
    //  GET /admin/stats
    //  GET /admin/offres_attente
    //  GET /admin/utilisateurs
    // ================================================================
    case 'GET':

        if ($action === 'stats') {
            $db = db();

            $utilisateurs = (int) $db->query('SELECT COUNT(*) FROM utilisateur')->fetchColumn();

            // Offres actives = hebergements disponibles + activites disponibles + transports (pas de statut → toujours comptés)
            $heb_actifs = (int) $db->query("SELECT COUNT(*) FROM hebergement WHERE statut = 'disponible'")->fetchColumn();
            $act_actifs = (int) $db->query("SELECT COUNT(*) FROM activite WHERE statut = 'disponible'")->fetchColumn();
            $trans_actifs = (int) $db->query("SELECT COUNT(*) FROM transport")->fetchColumn();
            $offres_actives = $heb_actifs + $act_actifs + $trans_actifs;

            $reservations = (int) $db->query('SELECT COUNT(*) FROM reservation')->fetchColumn();

            // En attente = hebergements en_attente + activites en_attente
            $heb_attente = (int) $db->query("SELECT COUNT(*) FROM hebergement WHERE statut = 'en_attente'")->fetchColumn();
            $act_attente = (int) $db->query("SELECT COUNT(*) FROM activite WHERE statut = 'en_attente'")->fetchColumn();
            $en_attente = $heb_attente + $act_attente;

            Response::ok([
                'utilisateurs'  => $utilisateurs,
                'offres_actives' => $offres_actives,
                'reservations'  => $reservations,
                'en_attente'    => $en_attente,
            ]);
        }

        if ($action === 'offres_attente') {
            $db = db();

            // Hébergements en attente avec le nom du prestataire
            $stmt = $db->prepare(
                "SELECT h.id_hebergement AS id,
                        h.nom,
                        h.statut,
                        'hebergement' AS categorie_offre,
                        CONCAT(u.prenom, ' ', u.nom) AS prestataire
                 FROM hebergement h
                 JOIN utilisateur u ON u.id_utilisateur = h.id_prestataire
                 WHERE h.statut = 'en_attente'"
            );
            $stmt->execute();
            $hebergements = $stmt->fetchAll();

            // Activités en attente avec le nom du prestataire
            $stmt = $db->prepare(
                "SELECT a.id_activite AS id,
                        a.nom,
                        a.statut,
                        'activite' AS categorie_offre,
                        CONCAT(u.prenom, ' ', u.nom) AS prestataire
                 FROM activite a
                 JOIN utilisateur u ON u.id_utilisateur = a.id_prestataire
                 WHERE a.statut = 'en_attente'"
            );
            $stmt->execute();
            $activites = $stmt->fetchAll();

            $offres = array_merge($hebergements, $activites);

            // Cast ids to int
            $offres = array_map(function ($o) {
                $o['id'] = (int) $o['id'];
                return $o;
            }, $offres);

            Response::ok(['offres' => $offres]);
        }

        if ($action === 'utilisateurs') {
            $db = db();
            $stmt = $db->prepare(
                'SELECT id_utilisateur, nom, prenom, email, role, statut, telephone, date_inscription, photo_profil
                 FROM utilisateur
                 ORDER BY date_inscription DESC'
            );
            $stmt->execute();
            $users = $stmt->fetchAll();
            $users = array_map(function ($u) {
                $u['id_utilisateur'] = (int) $u['id_utilisateur'];
                return $u;
            }, $users);
            Response::ok(['users' => $users]);
        }

        Response::notFound("Action admin GET inconnue : $action");
        break;

    // ================================================================
    //  PUT /admin/offres/:type/:id          body { statut }
    //  PUT /admin/utilisateurs/:id/role     body { role }
    //  PUT /admin/utilisateurs/:id/statut   body { statut }
    // ================================================================
    case 'PUT':
        $data = body();

        if ($action === 'offres') {
            // segments[0]='offres', segments[1]=type, segments[2]=id
            // Mais attention : index.php a déjà shifté $resource='admin',
            // puis a essayé de mettre le 1er segment numérique dans $id.
            // Ici $segments = ['offres', 'hebergement', '5'] ou similaire.
            $type    = $segments[1] ?? '';
            $offreId = isset($segments[2]) ? (int) $segments[2] : ($id ?? 0);

            if (!in_array($type, ['hebergement', 'activite'], true)) {
                Response::error("Type d'offre invalide. Attendu : hebergement ou activite.", 422);
            }
            if (!$offreId) {
                Response::error('Identifiant manquant.', 422);
            }

            $statut = $data['statut'] ?? '';
            if (!in_array($statut, ['disponible', 'rejete'], true)) {
                Response::error("Statut invalide. Attendu : disponible ou rejete.", 422);
            }

            $table = ($type === 'hebergement') ? 'hebergement' : 'activite';
            $pkCol = ($type === 'hebergement') ? 'id_hebergement' : 'id_activite';

            $stmt = db()->prepare("UPDATE {$table} SET statut = ? WHERE {$pkCol} = ?");
            $stmt->execute([$statut, $offreId]);

            if ($stmt->rowCount() === 0) {
                Response::notFound("Offre introuvable.");
            }
            Response::ok(['message' => 'Statut mis à jour.', 'statut' => $statut]);
        }

        if ($action === 'utilisateurs') {
            // Deux sous-cas :
            //   PUT /admin/utilisateurs/:id/role    -> segments = ['utilisateurs', '3', 'role']
            //   PUT /admin/utilisateurs/:id/statut  -> segments = ['utilisateurs', '3', 'statut']
            // index.php a peut-être consommé l'id numérique dans $id si c'était le 1er segment.
            // Ici segments[0]='utilisateurs', segments[1]='3' (ou déjà dans $id), segments[2]='role'|'statut'

            // Reconstruire userId et sous-action
            $userId    = null;
            $subAction = null;

            if (isset($segments[1]) && ctype_digit($segments[1])) {
                $userId    = (int) $segments[1];
                $subAction = $segments[2] ?? '';
            } elseif ($id !== null) {
                $userId    = $id;
                $subAction = $segments[1] ?? '';
            }

            if (!$userId) {
                Response::error('Identifiant utilisateur manquant.', 422);
            }

            if ($subAction === 'role') {
                $role = $data['role'] ?? '';
                if (!in_array($role, ['voyageur', 'prestataire', 'admin'], true)) {
                    Response::error("Rôle invalide. Attendu : voyageur, prestataire ou admin.", 422);
                }
                $stmt = db()->prepare('UPDATE utilisateur SET role = ? WHERE id_utilisateur = ?');
                $stmt->execute([$role, $userId]);
                if ($stmt->rowCount() === 0) {
                    Response::notFound("Utilisateur introuvable.");
                }
                Response::ok(['message' => 'Rôle mis à jour.', 'role' => $role]);
            }

            if ($subAction === 'statut') {
                $statut = $data['statut'] ?? '';
                if (!in_array($statut, ['actif', 'inactif'], true)) {
                    Response::error("Statut invalide. Attendu : actif ou inactif.", 422);
                }
                $stmt = db()->prepare('UPDATE utilisateur SET statut = ? WHERE id_utilisateur = ?');
                $stmt->execute([$statut, $userId]);
                if ($stmt->rowCount() === 0) {
                    Response::notFound("Utilisateur introuvable.");
                }
                Response::ok(['message' => 'Statut mis à jour.', 'statut' => $statut]);
            }

            Response::error("Sous-action inconnue : $subAction", 400);
        }

        Response::notFound("Action admin PUT inconnue : $action");
        break;

    // ================================================================
    //  DELETE /admin/utilisateurs/:id
    // ================================================================
    case 'DELETE':

        if ($action === 'utilisateurs') {
            // segments = ['utilisateurs', '3'] ou $id déjà résolu
            $userId = null;
            if (isset($segments[1]) && ctype_digit($segments[1])) {
                $userId = (int) $segments[1];
            } elseif ($id !== null) {
                $userId = $id;
            }

            if (!$userId) {
                Response::error('Identifiant utilisateur manquant.', 422);
            }

            $stmt = db()->prepare('DELETE FROM utilisateur WHERE id_utilisateur = ?');
            $stmt->execute([$userId]);

            if ($stmt->rowCount() === 0) {
                Response::notFound("Utilisateur introuvable.");
            }
            Response::ok(['message' => 'Utilisateur supprimé.']);
        }

        Response::notFound("Action admin DELETE inconnue : $action");
        break;

    default:
        Response::error('Méthode non supportée', 405);
}
