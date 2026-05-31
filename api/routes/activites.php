<?php
/**
 * Route ACTIVITES — /api/activites/...
 *
 * Endpoints :
 *   GET    /api/activites              ?id_destination=&type=&prix_max=&q=
 *   GET    /api/activites/:id          détail + note_moyenne + nb_avis
 *   POST   /api/activites              (prestataire/admin) création
 *   PUT    /api/activites/:id          modifie (propriétaire ou admin)
 *   DELETE /api/activites/:id          supprime (propriétaire ou admin)
 *
 * Variables disponibles (fournies par index.php) : $method, $id, $segments
 */

switch ($method) {

    // ---------------------------------------------------------------
    // GET /activites  ou  GET /activites/:id
    // ---------------------------------------------------------------
    case 'GET':
        if ($id) {
            // --- Détail d'une activité ---
            $stmt = db()->prepare(
                'SELECT a.*,
                        d.nom AS nom_destination,
                        ROUND(AVG(av.note), 1) AS note_moyenne,
                        COUNT(av.id_avis)      AS nb_avis
                 FROM activite a
                 LEFT JOIN destination d ON d.id_destination = a.id_destination
                 LEFT JOIN avis av ON av.id_activite = a.id_activite AND av.type_cible = \'activite\'
                 WHERE a.id_activite = ?
                 GROUP BY a.id_activite'
            );
            $stmt->execute([$id]);
            $activite = $stmt->fetch();

            if (!$activite) {
                Response::notFound('Activité introuvable.');
            }

            $activite['id_activite']        = (int) $activite['id_activite'];
            $activite['id_destination']     = (int) $activite['id_destination'];
            $activite['id_prestataire']     = (int) $activite['id_prestataire'];
            $activite['prix_personne']      = (float) $activite['prix_personne'];
            $activite['duree_heures']       = $activite['duree_heures'] !== null ? (float) $activite['duree_heures'] : null;
            $activite['capacite_max']       = (int) $activite['capacite_max'];
            $activite['places_disponibles'] = (int) $activite['places_disponibles'];
            $activite['note_moyenne']       = $activite['note_moyenne'] !== null ? (float) $activite['note_moyenne'] : null;
            $activite['nb_avis']            = (int) $activite['nb_avis'];

            Response::ok(['activite' => $activite]);

        } else {
            // --- Liste avec filtres optionnels ---
            $conditions = ["a.statut IN ('disponible','complet')"];
            $params     = [];

            // Filtre destination
            if (!empty($_GET['id_destination']) && ctype_digit((string)$_GET['id_destination'])) {
                $conditions[] = 'a.id_destination = ?';
                $params[]     = (int) $_GET['id_destination'];
            }

            // Filtre type
            $typesValides = ['culture', 'aventure', 'gastronomie', 'nature', 'bienetre', 'sport'];
            if (!empty($_GET['type']) && in_array($_GET['type'], $typesValides, true)) {
                $conditions[] = 'a.type = ?';
                $params[]     = $_GET['type'];
            }

            // Filtre prix max
            if (!empty($_GET['prix_max']) && is_numeric($_GET['prix_max'])) {
                $conditions[] = 'a.prix_personne <= ?';
                $params[]     = (float) $_GET['prix_max'];
            }

            // Filtre recherche (nom LIKE)
            if (!empty($_GET['q'])) {
                $conditions[] = 'a.nom LIKE ?';
                $params[]     = '%' . $_GET['q'] . '%';
            }

            $where = 'WHERE ' . implode(' AND ', $conditions);

            $sql = "SELECT a.*, d.nom AS nom_destination
                    FROM activite a
                    LEFT JOIN destination d ON d.id_destination = a.id_destination
                    $where
                    ORDER BY a.nom ASC";

            $stmt = db()->prepare($sql);
            $stmt->execute($params);
            $activites = $stmt->fetchAll();

            foreach ($activites as &$act) {
                $act['id_activite']        = (int) $act['id_activite'];
                $act['id_destination']     = (int) $act['id_destination'];
                $act['id_prestataire']     = (int) $act['id_prestataire'];
                $act['prix_personne']      = (float) $act['prix_personne'];
                $act['duree_heures']       = $act['duree_heures'] !== null ? (float) $act['duree_heures'] : null;
                $act['capacite_max']       = (int) $act['capacite_max'];
                $act['places_disponibles'] = (int) $act['places_disponibles'];
            }
            unset($act);

            Response::ok(['activites' => $activites]);
        }
        break;

    // ---------------------------------------------------------------
    // POST /activites  — création (prestataire / admin)
    // ---------------------------------------------------------------
    case 'POST':
        $user = Auth::requireRole('prestataire', 'admin');
        $data = body();
        require_fields($data, ['nom', 'type', 'prix_personne', 'id_destination']);

        $typesValides = ['culture', 'aventure', 'gastronomie', 'nature', 'bienetre', 'sport'];
        if (!in_array($data['type'], $typesValides, true)) {
            Response::error('Type invalide. Valeurs acceptées : ' . implode(', ', $typesValides), 422);
        }

        $capacite = isset($data['capacite_max']) ? (int) $data['capacite_max'] : 20;

        $stmt = db()->prepare(
            'INSERT INTO activite
                (nom, description, type, prix_personne, duree_heures, capacite_max, places_disponibles,
                 photo_url, statut, id_destination, id_prestataire)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'en_attente\', ?, ?)'
        );
        $stmt->execute([
            $data['nom'],
            $data['description']  ?? null,
            $data['type'],
            (float) $data['prix_personne'],
            isset($data['duree_heures']) ? (float) $data['duree_heures'] : null,
            $capacite,
            isset($data['places_disponibles']) ? (int) $data['places_disponibles'] : $capacite,
            $data['photo_url']    ?? null,
            (int) $data['id_destination'],
            (int) $user['id_utilisateur'],
        ]);
        $newId = (int) db()->lastInsertId();

        $row = db()->prepare('SELECT a.*, d.nom AS nom_destination FROM activite a LEFT JOIN destination d ON d.id_destination = a.id_destination WHERE a.id_activite = ?');
        $row->execute([$newId]);
        $activite = $row->fetch();
        $activite['id_activite'] = (int) $activite['id_activite'];

        Response::created(['activite' => $activite]);
        break;

    // ---------------------------------------------------------------
    // PUT /activites/:id  — mise à jour (propriétaire ou admin)
    // ---------------------------------------------------------------
    case 'PUT':
        if (!$id) {
            Response::error('ID d\'activité requis.', 400);
        }
        $user = Auth::requireLogin();

        // Récupérer l'activité pour vérifier les droits
        $check = db()->prepare('SELECT * FROM activite WHERE id_activite = ?');
        $check->execute([$id]);
        $existing = $check->fetch();
        if (!$existing) {
            Response::notFound('Activité introuvable.');
        }

        // Propriétaire ou admin
        if ($user['role'] !== 'admin' && (int)$existing['id_prestataire'] !== (int)$user['id_utilisateur']) {
            Response::forbidden('Accès refusé.');
        }

        $data = body();

        $allowed = ['nom', 'description', 'type', 'prix_personne', 'duree_heures', 'capacite_max',
                    'places_disponibles', 'photo_url', 'statut', 'id_destination'];
        $set    = [];
        $values = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                if ($field === 'type') {
                    $typesValides = ['culture', 'aventure', 'gastronomie', 'nature', 'bienetre', 'sport'];
                    if (!in_array($data[$field], $typesValides, true)) {
                        Response::error('Type invalide.', 422);
                    }
                }
                $set[]    = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($set)) {
            Response::error('Aucun champ à mettre à jour.', 400);
        }

        $values[] = $id;
        $stmt = db()->prepare('UPDATE activite SET ' . implode(', ', $set) . ' WHERE id_activite = ?');
        $stmt->execute($values);

        $row = db()->prepare('SELECT a.*, d.nom AS nom_destination FROM activite a LEFT JOIN destination d ON d.id_destination = a.id_destination WHERE a.id_activite = ?');
        $row->execute([$id]);
        $activite = $row->fetch();
        $activite['id_activite']        = (int) $activite['id_activite'];
        $activite['id_destination']     = (int) $activite['id_destination'];
        $activite['places_disponibles'] = (int) $activite['places_disponibles'];

        Response::ok(['activite' => $activite]);
        break;

    // ---------------------------------------------------------------
    // DELETE /activites/:id  — suppression (propriétaire ou admin)
    // ---------------------------------------------------------------
    case 'DELETE':
        if (!$id) {
            Response::error('ID d\'activité requis.', 400);
        }
        $user = Auth::requireLogin();

        $check = db()->prepare('SELECT id_prestataire FROM activite WHERE id_activite = ?');
        $check->execute([$id]);
        $existing = $check->fetch();
        if (!$existing) {
            Response::notFound('Activité introuvable.');
        }

        if ($user['role'] !== 'admin' && (int)$existing['id_prestataire'] !== (int)$user['id_utilisateur']) {
            Response::forbidden('Accès refusé.');
        }

        $stmt = db()->prepare('DELETE FROM activite WHERE id_activite = ?');
        $stmt->execute([$id]);

        Response::ok(['message' => 'Activité supprimée.']);
        break;

    default:
        Response::error('Méthode non supportée.', 405);
}
