<?php
/**
 * Route DESTINATIONS — /api/destinations/...
 *
 * Endpoints :
 *   GET    /api/destinations              ?q=&categorie=&tri=
 *   GET    /api/destinations/:id          détail + note_moyenne + nb_avis
 *   POST   /api/destinations              (admin/prestataire) création
 *   PUT    /api/destinations/:id          (admin/prestataire) mise à jour
 *   DELETE /api/destinations/:id          (admin) suppression
 *
 * Variables disponibles (fournies par index.php) : $method, $id, $segments
 */

switch ($method) {

    // ---------------------------------------------------------------
    // GET /destinations  ou  GET /destinations/:id
    // ---------------------------------------------------------------
    case 'GET':
        if ($id) {
            // --- Détail d'une destination ---
            $stmt = db()->prepare(
                'SELECT d.*,
                        ROUND(AVG(a.note), 1) AS note_moyenne,
                        COUNT(a.id_avis)      AS nb_avis
                 FROM destination d
                 LEFT JOIN avis a
                        ON a.id_destination = d.id_destination
                       AND a.type_cible = \'destination\'
                 WHERE d.id_destination = ?
                 GROUP BY d.id_destination'
            );
            $stmt->execute([$id]);
            $destination = $stmt->fetch();

            if (!$destination) {
                Response::notFound('Destination introuvable.');
            }

            $destination['id_destination'] = (int) $destination['id_destination'];
            $destination['note_moyenne']   = $destination['note_moyenne'] !== null
                ? (float) $destination['note_moyenne'] : null;
            $destination['nb_avis']        = (int) $destination['nb_avis'];

            Response::ok(['destination' => $destination]);

        } else {
            // --- Liste avec filtres optionnels ---
            $conditions = [];
            $params     = [];

            // Filtre texte (nom ou pays, LIKE)
            if (!empty($_GET['q'])) {
                $conditions[] = '(d.nom LIKE ? OR d.pays LIKE ?)';
                $like = '%' . $_GET['q'] . '%';
                $params[] = $like;
                $params[] = $like;
            }

            // Filtre catégorie
            $categoriesValides = ['plage', 'montagne', 'ville', 'culture', 'aventure'];
            if (!empty($_GET['categorie']) && in_array($_GET['categorie'], $categoriesValides, true)) {
                $conditions[] = 'd.categorie = ?';
                $params[]     = $_GET['categorie'];
            }

            $where = $conditions ? ('WHERE ' . implode(' AND ', $conditions)) : '';

            // Tri
            $triAutorise = ['nom', 'pays'];
            $tri = (!empty($_GET['tri']) && in_array($_GET['tri'], $triAutorise, true))
                ? $_GET['tri'] : 'nom';

            $sql = "SELECT * FROM destination d $where ORDER BY d.$tri ASC";

            $stmt = db()->prepare($sql);
            $stmt->execute($params);
            $destinations = $stmt->fetchAll();

            // Cast des types
            foreach ($destinations as &$dest) {
                $dest['id_destination'] = (int) $dest['id_destination'];
            }
            unset($dest);

            Response::ok(['destinations' => $destinations]);
        }
        break;

    // ---------------------------------------------------------------
    // POST /destinations  — création (admin / prestataire)
    // ---------------------------------------------------------------
    case 'POST':
        Auth::requireRole('admin', 'prestataire');
        $data = body();
        require_fields($data, ['nom', 'pays', 'categorie']);

        $categoriesValides = ['plage', 'montagne', 'ville', 'culture', 'aventure'];
        if (!in_array($data['categorie'], $categoriesValides, true)) {
            Response::error('Catégorie invalide. Valeurs acceptées : ' . implode(', ', $categoriesValides), 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO destination (nom, pays, continent, description, latitude, longitude, photo_url, categorie)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['nom'],
            $data['pays'],
            $data['continent']   ?? null,
            $data['description'] ?? null,
            $data['latitude']    ?? null,
            $data['longitude']   ?? null,
            $data['photo_url']   ?? null,
            $data['categorie'],
        ]);
        $newId = (int) db()->lastInsertId();

        $dest = db()->prepare('SELECT * FROM destination WHERE id_destination = ?');
        $dest->execute([$newId]);
        $destination = $dest->fetch();
        $destination['id_destination'] = (int) $destination['id_destination'];

        Response::created(['destination' => $destination]);
        break;

    // ---------------------------------------------------------------
    // PUT /destinations/:id  — mise à jour (admin / prestataire)
    // ---------------------------------------------------------------
    case 'PUT':
        if (!$id) {
            Response::error('ID de destination requis.', 400);
        }
        Auth::requireRole('admin', 'prestataire');
        $data = body();

        // Vérifier que la destination existe
        $check = db()->prepare('SELECT id_destination FROM destination WHERE id_destination = ?');
        $check->execute([$id]);
        if (!$check->fetch()) {
            Response::notFound('Destination introuvable.');
        }

        // Construire la mise à jour dynamique (uniquement les champs fournis)
        $allowed = ['nom', 'pays', 'continent', 'description', 'latitude', 'longitude', 'photo_url', 'categorie'];
        $set     = [];
        $values  = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                if ($field === 'categorie') {
                    $categoriesValides = ['plage', 'montagne', 'ville', 'culture', 'aventure'];
                    if (!in_array($data[$field], $categoriesValides, true)) {
                        Response::error('Catégorie invalide.', 422);
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
        $stmt = db()->prepare('UPDATE destination SET ' . implode(', ', $set) . ' WHERE id_destination = ?');
        $stmt->execute($values);

        $dest = db()->prepare('SELECT * FROM destination WHERE id_destination = ?');
        $dest->execute([$id]);
        $destination = $dest->fetch();
        $destination['id_destination'] = (int) $destination['id_destination'];

        Response::ok(['destination' => $destination]);
        break;

    // ---------------------------------------------------------------
    // DELETE /destinations/:id  — suppression (admin uniquement)
    // ---------------------------------------------------------------
    case 'DELETE':
        if (!$id) {
            Response::error('ID de destination requis.', 400);
        }
        Auth::requireRole('admin');

        $check = db()->prepare('SELECT id_destination FROM destination WHERE id_destination = ?');
        $check->execute([$id]);
        if (!$check->fetch()) {
            Response::notFound('Destination introuvable.');
        }

        $stmt = db()->prepare('DELETE FROM destination WHERE id_destination = ?');
        $stmt->execute([$id]);

        Response::ok(['message' => 'Destination supprimée.']);
        break;

    default:
        Response::error('Méthode non supportée.', 405);
}
