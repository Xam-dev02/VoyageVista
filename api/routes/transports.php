<?php
/**
 * Route TRANSPORTS — /api/transports/...
 *
 * GET    /api/transports                     Liste avec filtres
 * GET    /api/transports/:id                 Détail
 * POST   /api/transports                     Crée (prestataire/admin)
 * PUT    /api/transports/:id                 Modifie (propriétaire/admin)
 * DELETE /api/transports/:id                 Supprime (propriétaire/admin)
 *
 * Variables disponibles (fournies par index.php) : $method, $id, $segments
 */

/**
 * Génère et insère des trajets réalistes pour une paire de villes
 * (type/prix/durée calculés sur la distance géographique). Mise en cache :
 * appelée une seule fois par paire, ensuite les trajets existent en base.
 */
function genererTrajets(int $orig, int $arr): void
{
    $stmt = db()->prepare('SELECT id_destination, latitude, longitude FROM destination WHERE id_destination IN (?, ?)');
    $stmt->execute([$orig, $arr]);
    $c = [];
    foreach ($stmt->fetchAll() as $r) { $c[(int) $r['id_destination']] = $r; }
    if (!isset($c[$orig], $c[$arr]) || $c[$orig]['latitude'] === null || $c[$arr]['latitude'] === null) return;

    $la1 = deg2rad((float) $c[$orig]['latitude']);  $lo1 = deg2rad((float) $c[$orig]['longitude']);
    $la2 = deg2rad((float) $c[$arr]['latitude']);   $lo2 = deg2rad((float) $c[$arr]['longitude']);
    $a = sin(($la2 - $la1) / 2) ** 2 + cos($la1) * cos($la2) * sin(($lo2 - $lo1) / 2) ** 2;
    $dist = 6371 * 2 * asin(min(1, sqrt($a))); // km

    $avions = ['Air France', 'Lufthansa', 'Emirates', 'Qatar Airways', 'KLM', 'Turkish Airlines', 'British Airways', 'Singapore Airlines', 'Vueling', 'easyJet'];
    $trains = ['TGV', 'Eurostar', 'Renfe AVE', 'Trenitalia', 'ICE', 'Thalys'];
    $autos  = ['Europcar', 'Hertz', 'Sixt', 'Avis'];

    // [type, compagnie, prix, duree_min, classe]
    $opts = [];
    if ($dist < 250) {
        $opts[] = ['voiture', 'Location ' . $autos[array_rand($autos)], round(0.13 * $dist + 15), max(30, round($dist / 85 * 60)), 'economique'];
        $opts[] = ['train',   $trains[array_rand($trains)],             round(0.16 * $dist + 10), max(20, round($dist / 110 * 60)), 'economique'];
    } elseif ($dist < 900) {
        $opts[] = ['train', $trains[array_rand($trains)], round(0.16 * $dist + 10), round($dist / 110 * 60), 'economique'];
        $opts[] = ['avion', $avions[array_rand($avions)], round(0.11 * $dist + 45), round(90 + $dist / 780 * 60), 'economique'];
    } else {
        $opts[] = ['avion', $avions[array_rand($avions)], round(0.10 * $dist + 50),       round(95 + $dist / 800 * 60), 'economique'];
        $opts[] = ['avion', $avions[array_rand($avions)], round((0.10 * $dist + 50) * 2.3), round(95 + $dist / 800 * 60), 'business'];
    }

    $ins = db()->prepare(
        "INSERT INTO transport (type, compagnie, numero, date_depart, date_arrivee, classe, prix,
            places_totales, places_disponibles, id_origine, id_arrivee, id_prestataire)
         VALUES (?, ?, ?, ?, ?, ?, ?, 200, ?, ?, ?, 5)"
    );
    foreach ($opts as $i => [$type, $comp, $prix, $duree, $classe]) {
        $h = (7 + $i * 5 + random_int(0, 3)) % 24;
        $dep = sprintf('2026-06-01 %02d:%02d:00', $h, [0, 15, 30, 45][array_rand([0, 1, 2, 3])]);
        $arrTime = date('Y-m-d H:i:s', strtotime($dep) + (int) $duree * 60);
        $places = random_int(0, 6) === 0 ? 0 : random_int(8, 180);
        $num = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $comp), 0, 2)) . random_int(100, 9999);
        $ins->execute([$type, $comp, $num, $dep, $arrTime, $classe, $prix, $places, $orig, $arr]);
    }
}

switch ($method) {

    // ------------------------------------------------------------------ GET
    case 'GET':
        if ($id !== null) {
            // --- Détail d'un transport ---
            $stmt = db()->prepare(
                "SELECT t.*,
                        d_orig.nom  AS nom_origine,
                        d_arr.nom   AS nom_arrivee,
                        TIMESTAMPDIFF(MINUTE, t.date_depart, t.date_arrivee) AS duree_minutes
                 FROM transport t
                 JOIN destination d_orig ON d_orig.id_destination = t.id_origine
                 JOIN destination d_arr  ON d_arr.id_destination  = t.id_arrivee
                 WHERE t.id_transport = ?"
            );
            $stmt->execute([$id]);
            $transport = $stmt->fetch();
            if (!$transport) {
                Response::notFound('Transport introuvable.');
            }
            Response::ok(['transport' => $transport]);
        }

        // --- Liste avec filtres optionnels ---
        $where  = [];
        $params = [];

        if (!empty($_GET['id_origine'])) {
            $where[]  = 't.id_origine = ?';
            $params[] = (int) $_GET['id_origine'];
        }
        if (!empty($_GET['id_arrivee'])) {
            $where[]  = 't.id_arrivee = ?';
            $params[] = (int) $_GET['id_arrivee'];
        }
        $types_valides = ['avion', 'train', 'voiture', 'ferry'];
        if (!empty($_GET['type']) && in_array($_GET['type'], $types_valides, true)) {
            $where[]  = 't.type = ?';
            $params[] = $_GET['type'];
        }
        // NB : pas de filtre par date — un trajet est proposé pour n'importe quelle date
        // (réservation simulée) ; la date du voyage est portée par l'étape de l'itinéraire.

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $tris_valides = ['prix' => 't.prix ASC', 'duree' => 'duree_minutes ASC', 'depart' => 't.date_depart ASC'];
        $tri = $tris_valides[$_GET['tri'] ?? ''] ?? 't.date_depart ASC';

        $sql = "SELECT t.*,
                       d_orig.nom  AS nom_origine,
                       d_arr.nom   AS nom_arrivee,
                       TIMESTAMPDIFF(MINUTE, t.date_depart, t.date_arrivee) AS duree_minutes
                FROM transport t
                JOIN destination d_orig ON d_orig.id_destination = t.id_origine
                JOIN destination d_arr  ON d_arr.id_destination  = t.id_arrivee
                $whereClause
                ORDER BY $tri";

        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $transports = $stmt->fetchAll();

        // Génération paresseuse : paire précise sans aucun trajet -> on crée les options
        $o = !empty($_GET['id_origine']) ? (int) $_GET['id_origine'] : null;
        $a = !empty($_GET['id_arrivee']) ? (int) $_GET['id_arrivee'] : null;
        if (empty($transports) && $o && $a && $o !== $a) {
            genererTrajets($o, $a);
            $stmt->execute($params);
            $transports = $stmt->fetchAll();
        }
        Response::ok(['transports' => $transports]);
        break;

    // ------------------------------------------------------------------ POST
    case 'POST':
        $user = Auth::requireRole('prestataire', 'admin');
        $data = body();
        require_fields($data, ['type', 'compagnie', 'date_depart', 'date_arrivee', 'prix', 'id_origine', 'id_arrivee']);

        // Vérifier cohérence des dates
        if (strtotime($data['date_arrivee']) <= strtotime($data['date_depart'])) {
            Response::error('Dates incohérentes : date_arrivee doit être après date_depart.', 422);
        }

        // Vérifier type valide
        if (!in_array($data['type'], ['avion', 'train', 'voiture', 'ferry'], true)) {
            Response::error('Type invalide. Valeurs autorisées : avion, train, voiture, ferry.', 422);
        }

        $places_totales    = isset($data['places_totales'])    ? (int) $data['places_totales']    : 100;
        $places_disponibles = isset($data['places_disponibles']) ? (int) $data['places_disponibles'] : $places_totales;

        $stmt = db()->prepare(
            "INSERT INTO transport
             (type, compagnie, numero, date_depart, date_arrivee, classe, prix,
              places_totales, places_disponibles, id_origine, id_arrivee, id_prestataire)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['type'],
            $data['compagnie'],
            $data['numero']  ?? null,
            $data['date_depart'],
            $data['date_arrivee'],
            in_array($data['classe'] ?? '', ['economique', 'business', 'premiere'], true)
                ? $data['classe'] : 'economique',
            $data['prix'],
            $places_totales,
            $places_disponibles,
            (int) $data['id_origine'],
            (int) $data['id_arrivee'],
            $user['id_utilisateur'],
        ]);
        $newId = (int) db()->lastInsertId();

        $stmt = db()->prepare(
            "SELECT t.*,
                    d_orig.nom AS nom_origine,
                    d_arr.nom  AS nom_arrivee,
                    TIMESTAMPDIFF(MINUTE, t.date_depart, t.date_arrivee) AS duree_minutes
             FROM transport t
             JOIN destination d_orig ON d_orig.id_destination = t.id_origine
             JOIN destination d_arr  ON d_arr.id_destination  = t.id_arrivee
             WHERE t.id_transport = ?"
        );
        $stmt->execute([$newId]);
        $transport = $stmt->fetch();
        Response::created(['transport' => $transport]);
        break;

    // ------------------------------------------------------------------ PUT
    case 'PUT':
        if ($id === null) {
            Response::error('Identifiant requis.', 400);
        }
        $user = Auth::requireLogin();

        // Vérifier propriétaire ou admin
        $stmt = db()->prepare('SELECT id_prestataire FROM transport WHERE id_transport = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            Response::notFound('Transport introuvable.');
        }
        if ($user['role'] !== 'admin' && $existing['id_prestataire'] !== $user['id_utilisateur']) {
            Response::forbidden('Accès refusé : vous n\'êtes pas le propriétaire de ce transport.');
        }

        $data = body();

        // Vérification dates si les deux sont fournies
        if (isset($data['date_depart'], $data['date_arrivee'])) {
            if (strtotime($data['date_arrivee']) <= strtotime($data['date_depart'])) {
                Response::error('Dates incohérentes : date_arrivee doit être après date_depart.', 422);
            }
        }

        // Construire la mise à jour dynamique
        $fields = [];
        $params = [];
        $allowed = ['type', 'compagnie', 'numero', 'date_depart', 'date_arrivee',
                    'classe', 'prix', 'places_totales', 'places_disponibles',
                    'id_origine', 'id_arrivee'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = ?";
                $params[] = $data[$f];
            }
        }
        if (!$fields) {
            Response::error('Aucun champ à modifier.', 422);
        }
        $params[] = $id;
        $stmt = db()->prepare('UPDATE transport SET ' . implode(', ', $fields) . ' WHERE id_transport = ?');
        $stmt->execute($params);

        $stmt = db()->prepare(
            "SELECT t.*,
                    d_orig.nom AS nom_origine,
                    d_arr.nom  AS nom_arrivee,
                    TIMESTAMPDIFF(MINUTE, t.date_depart, t.date_arrivee) AS duree_minutes
             FROM transport t
             JOIN destination d_orig ON d_orig.id_destination = t.id_origine
             JOIN destination d_arr  ON d_arr.id_destination  = t.id_arrivee
             WHERE t.id_transport = ?"
        );
        $stmt->execute([$id]);
        Response::ok(['transport' => $stmt->fetch()]);
        break;

    // ------------------------------------------------------------------ DELETE
    case 'DELETE':
        if ($id === null) {
            Response::error('Identifiant requis.', 400);
        }
        $user = Auth::requireLogin();

        $stmt = db()->prepare('SELECT id_prestataire FROM transport WHERE id_transport = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            Response::notFound('Transport introuvable.');
        }
        if ($user['role'] !== 'admin' && $existing['id_prestataire'] !== $user['id_utilisateur']) {
            Response::forbidden('Accès refusé : vous n\'êtes pas le propriétaire de ce transport.');
        }

        $stmt = db()->prepare('DELETE FROM transport WHERE id_transport = ?');
        $stmt->execute([$id]);
        Response::ok(['message' => 'Transport supprimé.']);
        break;

    default:
        Response::error('Méthode non supportée.', 405);
}
