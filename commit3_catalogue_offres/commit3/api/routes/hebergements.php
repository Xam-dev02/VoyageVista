<?php
/**
 * Route HEBERGEMENTS — /api/hebergements/...
 *
 * Endpoints :
 *   GET    /api/hebergements              ?id_destination=&type=&etoiles_min=&prix_max=&q=&statut=
 *   GET    /api/hebergements/:id          détail + note_moyenne + nb_avis
 *   POST   /api/hebergements              (prestataire/admin) création
 *   PUT    /api/hebergements/:id          modifie (propriétaire ou admin)
 *   DELETE /api/hebergements/:id          supprime (propriétaire ou admin)
 *
 * Variables disponibles (fournies par index.php) : $method, $id, $segments
 */

$typesValides = ['hotel', 'villa', 'auberge', 'resort', 'appartement'];
$statutsValides = ['disponible', 'indisponible', 'en_attente'];

switch ($method) {

    // -------------------------------------------------------------------
    // GET /hebergements  ou  GET /hebergements/:id
    // -------------------------------------------------------------------
    case 'GET':
        if ($id) {
            // --- Détail d'un hébergement (+ note_moyenne + nb_avis) ---
            $stmt = db()->prepare(
                'SELECT h.*,
                        d.nom AS nom_destination,
                        ROUND(AVG(a.note), 1) AS note_moyenne,
                        COUNT(a.id_avis)       AS nb_avis
                 FROM hebergement h
                 LEFT JOIN destination d ON d.id_destination = h.id_destination
                 LEFT JOIN avis a
                        ON a.id_hebergement = h.id_hebergement
                       AND a.type_cible = \'hebergement\'
                 WHERE h.id_hebergement = ?
                 GROUP BY h.id_hebergement'
            );
            $stmt->execute([$id]);
            $hebergement = $stmt->fetch();

            if (!$hebergement) {
                Response::notFound('Hébergement introuvable.');
            }

            $hebergement['id_hebergement'] = (int) $hebergement['id_hebergement'];
            $hebergement['id_destination'] = (int) $hebergement['id_destination'];
            $hebergement['id_prestataire'] = (int) $hebergement['id_prestataire'];
            $hebergement['etoiles']        = (int) $hebergement['etoiles'];
            $hebergement['prix_nuit']      = (float) $hebergement['prix_nuit'];
            $hebergement['capacite']       = (int) $hebergement['capacite'];
            $hebergement['note_moyenne']   = $hebergement['note_moyenne'] !== null
                ? (float) $hebergement['note_moyenne'] : null;
            $hebergement['nb_avis']        = (int) $hebergement['nb_avis'];

            Response::ok(['hebergement' => $hebergement]);

        } else {
            // --- Liste avec filtres optionnels ---
            $conditions = [];
            $params     = [];

            // Par défaut, filtre sur disponible pour le public
            // sauf si un paramètre statut est explicitement fourni
            if (!empty($_GET['statut']) && in_array($_GET['statut'], $statutsValides, true)) {
                $conditions[] = 'h.statut = ?';
                $params[]     = $_GET['statut'];
            } else {
                $conditions[] = 'h.statut = ?';
                $params[]     = 'disponible';
            }

            if (!empty($_GET['id_destination']) && ctype_digit((string)$_GET['id_destination'])) {
                $conditions[] = 'h.id_destination = ?';
                $params[]     = (int) $_GET['id_destination'];
            }

            if (!empty($_GET['type']) && in_array($_GET['type'], $typesValides, true)) {
                $conditions[] = 'h.type = ?';
                $params[]     = $_GET['type'];
            }

            if (!empty($_GET['etoiles_min']) && ctype_digit((string)$_GET['etoiles_min'])) {
                $conditions[] = 'h.etoiles >= ?';
                $params[]     = (int) $_GET['etoiles_min'];
            }

            if (!empty($_GET['prix_max']) && is_numeric($_GET['prix_max'])) {
                $conditions[] = 'h.prix_nuit <= ?';
                $params[]     = (float) $_GET['prix_max'];
            }

            if (!empty($_GET['q'])) {
                $conditions[] = 'h.nom LIKE ?';
                $params[]     = '%' . $_GET['q'] . '%';
            }

            $where = $conditions ? ('WHERE ' . implode(' AND ', $conditions)) : '';

            $sql = "SELECT h.*,
                           d.nom AS nom_destination
                    FROM hebergement h
                    LEFT JOIN destination d ON d.id_destination = h.id_destination
                    $where
                    ORDER BY h.nom ASC";

            $stmt = db()->prepare($sql);
            $stmt->execute($params);
            $hebergements = $stmt->fetchAll();

            foreach ($hebergements as &$h) {
                $h['id_hebergement'] = (int) $h['id_hebergement'];
                $h['id_destination'] = (int) $h['id_destination'];
                $h['id_prestataire'] = (int) $h['id_prestataire'];
                $h['etoiles']        = (int) $h['etoiles'];
                $h['prix_nuit']      = (float) $h['prix_nuit'];
                $h['capacite']       = (int) $h['capacite'];
            }
            unset($h);

            Response::ok(['hebergements' => $hebergements]);
        }
        break;

    // -------------------------------------------------------------------
    // POST /hebergements  — création (prestataire ou admin)
    // -------------------------------------------------------------------
    case 'POST':
        $user = Auth::requireRole('prestataire', 'admin');
        $data = body();
        require_fields($data, ['nom', 'type', 'prix_nuit', 'id_destination']);

        if (!in_array($data['type'], $typesValides, true)) {
            Response::error('Type invalide. Valeurs acceptées : ' . implode(', ', $typesValides), 422);
        }

        // Vérifier que la destination existe
        $checkDest = db()->prepare('SELECT id_destination FROM destination WHERE id_destination = ?');
        $checkDest->execute([$data['id_destination']]);
        if (!$checkDest->fetch()) {
            Response::error('Destination introuvable.', 404);
        }

        $stmt = db()->prepare(
            'INSERT INTO hebergement
                (nom, type, etoiles, prix_nuit, capacite, description, adresse,
                 equipements, photo_url, statut, id_destination, id_prestataire)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['nom'],
            $data['type'],
            isset($data['etoiles']) ? (int) $data['etoiles'] : null,
            (float) $data['prix_nuit'],
            isset($data['capacite']) ? (int) $data['capacite'] : 2,
            $data['description']  ?? null,
            $data['adresse']      ?? null,
            $data['equipements']  ?? null,
            $data['photo_url']    ?? null,
            'en_attente',   // statut par défaut pour nouvelles créations
            (int) $data['id_destination'],
            $user['id_utilisateur'],
        ]);
        $newId = (int) db()->lastInsertId();

        $row = db()->prepare(
            'SELECT h.*, d.nom AS nom_destination
             FROM hebergement h
             LEFT JOIN destination d ON d.id_destination = h.id_destination
             WHERE h.id_hebergement = ?'
        );
        $row->execute([$newId]);
        $hebergement = $row->fetch();
        $hebergement['id_hebergement'] = $newId;
        $hebergement['id_destination'] = (int) $hebergement['id_destination'];
        $hebergement['id_prestataire'] = (int) $hebergement['id_prestataire'];

        Response::created(['hebergement' => $hebergement]);
        break;

    // -------------------------------------------------------------------
    // PUT /hebergements/:id  — mise à jour (propriétaire ou admin)
    // -------------------------------------------------------------------
    case 'PUT':
        if (!$id) {
            Response::error('ID hébergement requis.', 400);
        }

        $user = Auth::requireLogin();

        // Récupérer l'hébergement pour vérifier le propriétaire
        $check = db()->prepare('SELECT id_hebergement, id_prestataire FROM hebergement WHERE id_hebergement = ?');
        $check->execute([$id]);
        $existing = $check->fetch();
        if (!$existing) {
            Response::notFound('Hébergement introuvable.');
        }

        // Seul le propriétaire ou un admin peut modifier
        if ($user['role'] !== 'admin' && (int) $existing['id_prestataire'] !== $user['id_utilisateur']) {
            Response::forbidden('Vous n\'êtes pas le propriétaire de cet hébergement.');
        }

        $data = body();

        $allowed = ['nom', 'type', 'etoiles', 'prix_nuit', 'capacite', 'description',
                    'adresse', 'equipements', 'photo_url', 'statut', 'id_destination'];
        $set    = [];
        $values = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                if ($field === 'type' && !in_array($data[$field], $typesValides, true)) {
                    Response::error('Type invalide.', 422);
                }
                if ($field === 'statut' && !in_array($data[$field], $statutsValides, true)) {
                    Response::error('Statut invalide.', 422);
                }
                $set[]    = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($set)) {
            Response::error('Aucun champ à mettre à jour.', 400);
        }

        $values[] = $id;
        $stmt = db()->prepare('UPDATE hebergement SET ' . implode(', ', $set) . ' WHERE id_hebergement = ?');
        $stmt->execute($values);

        $row = db()->prepare(
            'SELECT h.*, d.nom AS nom_destination
             FROM hebergement h
             LEFT JOIN destination d ON d.id_destination = h.id_destination
             WHERE h.id_hebergement = ?'
        );
        $row->execute([$id]);
        $hebergement = $row->fetch();
        $hebergement['id_hebergement'] = (int) $hebergement['id_hebergement'];

        Response::ok(['hebergement' => $hebergement]);
        break;

    // -------------------------------------------------------------------
    // DELETE /hebergements/:id  — suppression (propriétaire ou admin)
    // -------------------------------------------------------------------
    case 'DELETE':
        if (!$id) {
            Response::error('ID hébergement requis.', 400);
        }

        $user = Auth::requireLogin();

        $check = db()->prepare('SELECT id_hebergement, id_prestataire FROM hebergement WHERE id_hebergement = ?');
        $check->execute([$id]);
        $existing = $check->fetch();
        if (!$existing) {
            Response::notFound('Hébergement introuvable.');
        }

        if ($user['role'] !== 'admin' && (int) $existing['id_prestataire'] !== $user['id_utilisateur']) {
            Response::forbidden('Vous n\'êtes pas le propriétaire de cet hébergement.');
        }

        $stmt = db()->prepare('DELETE FROM hebergement WHERE id_hebergement = ?');
        $stmt->execute([$id]);

        Response::ok(['message' => 'Hébergement supprimé.']);
        break;

    default:
        Response::error('Méthode non supportée.', 405);
}
