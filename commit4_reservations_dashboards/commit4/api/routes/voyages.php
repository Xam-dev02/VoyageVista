<?php
/**
 * Route VOYAGES — /api/voyages/...
 * Gère : itinéraires, étapes, activités d'étapes (panier).
 *
 * Variables disponibles (fournies par index.php) : $method, $id, $segments
 *
 * Routing résumé :
 *   GET  /voyages                         → liste voyages de l'utilisateur
 *   GET  /voyages/panier                  → brouillon courant (créé si absent)
 *   GET  /voyages/:id                     → détail complet
 *   POST /voyages                         → créer voyage
 *   PUT  /voyages/:id                     → modifier titre/nb_voyageurs
 *   DELETE /voyages/:id                   → supprimer
 *   POST /voyages/:id/etapes              → ajouter étape
 *   PUT  /voyages/etapes/:idEtape         → modifier étape (transport/hébergement/dates)
 *   DELETE /voyages/etapes/:idEtape       → supprimer étape
 *   POST /voyages/etapes/:idEtape/activites → ajouter activité à étape
 *   DELETE /voyages/activites/:idActivite → supprimer activité d'étape
 */

Auth::requireLogin();
$user = Auth::user();
$userId = (int) $user['id_utilisateur'];
$isAdmin = $user['role'] === 'admin';

// -------------------------------------------------------------------------
// Helpers internes
// -------------------------------------------------------------------------

/**
 * Recalcule et persiste prix_total du voyage.
 * total = somme(transport.prix) + somme(hebergement.prix_nuit * nuits)
 *       + somme(etape_activite.prix_calcule)
 */
function recomputePrixTotal(int $idVoyage): void
{
    $pdo = db();

    // Transport : prix par étape si transport associé
    $stmtT = $pdo->prepare(
        'SELECT COALESCE(SUM(t.prix), 0)
         FROM etape e
         JOIN transport t ON t.id_transport = e.id_transport
         WHERE e.id_voyage = ?'
    );
    $stmtT->execute([$idVoyage]);
    $prixTransports = (float) $stmtT->fetchColumn();

    // Hébergement : prix_nuit * nuits (nuits = max(1, DATEDIFF(date_depart, date_arrivee)))
    $stmtH = $pdo->prepare(
        'SELECT COALESCE(SUM(
            h.prix_nuit * GREATEST(1, CASE
                WHEN e.date_arrivee IS NOT NULL AND e.date_depart IS NOT NULL
                THEN DATEDIFF(e.date_depart, e.date_arrivee)
                ELSE 1
            END)
         ), 0)
         FROM etape e
         JOIN hebergement h ON h.id_hebergement = e.id_hebergement
         WHERE e.id_voyage = ?'
    );
    $stmtH->execute([$idVoyage]);
    $prixHebergements = (float) $stmtH->fetchColumn();

    // Activités : prix_calcule déjà stocké
    $stmtA = $pdo->prepare(
        'SELECT COALESCE(SUM(ea.prix_calcule), 0)
         FROM etape_activite ea
         JOIN etape e ON e.id_etape = ea.id_etape
         WHERE e.id_voyage = ?'
    );
    $stmtA->execute([$idVoyage]);
    $prixActivites = (float) $stmtA->fetchColumn();

    $total = round($prixTransports + $prixHebergements + $prixActivites, 2);

    $upd = $pdo->prepare('UPDATE voyage SET prix_total = ? WHERE id_voyage = ?');
    $upd->execute([$total, $idVoyage]);
}

/**
 * Retourne le voyage détaillé (étapes + hébergements + transports + activités).
 */
function getVoyageDetaille(int $idVoyage): array
{
    $pdo = db();

    $stmt = $pdo->prepare(
        'SELECT id_voyage, titre, statut, nb_voyageurs, prix_total
         FROM voyage WHERE id_voyage = ?'
    );
    $stmt->execute([$idVoyage]);
    $voyage = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$voyage) {
        return [];
    }
    $voyage['id_voyage']    = (int) $voyage['id_voyage'];
    $voyage['nb_voyageurs'] = (int) $voyage['nb_voyageurs'];
    $voyage['prix_total']   = (float) $voyage['prix_total'];

    // Étapes (ordonnées)
    $stmtE = $pdo->prepare(
        'SELECT e.id_etape, e.ordre, e.date_arrivee, e.date_depart,
                e.id_destination, e.id_hebergement, e.id_transport,
                d.nom AS dest_nom, d.pays AS dest_pays, d.continent AS dest_continent,
                d.description AS dest_description, d.photo_url AS dest_photo_url,
                d.latitude AS dest_latitude, d.longitude AS dest_longitude,
                d.categorie AS dest_categorie
         FROM etape e
         JOIN destination d ON d.id_destination = e.id_destination
         WHERE e.id_voyage = ?
         ORDER BY e.ordre ASC, e.id_etape ASC'
    );
    $stmtE->execute([$idVoyage]);
    $rawEtapes = $stmtE->fetchAll(PDO::FETCH_ASSOC);

    $etapes = [];
    foreach ($rawEtapes as $row) {
        $idEtape = (int) $row['id_etape'];

        // Destination
        $destination = [
            'id_destination' => (int) $row['id_destination'],
            'nom'            => $row['dest_nom'],
            'pays'           => $row['dest_pays'],
            'continent'      => $row['dest_continent'],
            'description'    => $row['dest_description'],
            'photo_url'      => $row['dest_photo_url'],
            'latitude'       => $row['dest_latitude'],
            'longitude'      => $row['dest_longitude'],
            'categorie'      => $row['dest_categorie'],
        ];

        // Hébergement
        $hebergement = null;
        if ($row['id_hebergement']) {
            $sh = $pdo->prepare(
                'SELECT id_hebergement, nom, type, etoiles, prix_nuit, capacite,
                        description, adresse, equipements, photo_url, statut,
                        id_destination, id_prestataire
                 FROM hebergement WHERE id_hebergement = ?'
            );
            $sh->execute([$row['id_hebergement']]);
            $hebergement = $sh->fetch(PDO::FETCH_ASSOC) ?: null;
            if ($hebergement) {
                $hebergement['id_hebergement'] = (int) $hebergement['id_hebergement'];
                $hebergement['etoiles']        = (int) $hebergement['etoiles'];
                $hebergement['prix_nuit']      = (float) $hebergement['prix_nuit'];
            }
        }

        // Transport
        $transport = null;
        if ($row['id_transport']) {
            $st = $pdo->prepare(
                'SELECT t.id_transport, t.type, t.compagnie, t.numero,
                        t.date_depart, t.date_arrivee, t.classe, t.prix,
                        t.places_totales, t.places_disponibles,
                        t.id_origine, t.id_arrivee,
                        do2.nom AS nom_origine, da.nom AS nom_arrivee
                 FROM transport t
                 JOIN destination do2 ON do2.id_destination = t.id_origine
                 JOIN destination da  ON da.id_destination  = t.id_arrivee
                 WHERE t.id_transport = ?'
            );
            $st->execute([$row['id_transport']]);
            $transport = $st->fetch(PDO::FETCH_ASSOC) ?: null;
            if ($transport) {
                $transport['id_transport']       = (int) $transport['id_transport'];
                $transport['prix']               = (float) $transport['prix'];
                $transport['places_totales']     = (int) $transport['places_totales'];
                $transport['places_disponibles'] = (int) $transport['places_disponibles'];
            }
        }

        // Activités
        $stmtAct = $pdo->prepare(
            'SELECT ea.id_etape_activite, ea.nb_personnes, ea.prix_calcule, ea.date_heure,
                    a.id_activite, a.nom, a.description, a.type, a.prix_personne,
                    a.duree_heures, a.capacite_max, a.places_disponibles,
                    a.photo_url, a.statut, a.id_destination, a.id_prestataire
             FROM etape_activite ea
             JOIN activite a ON a.id_activite = ea.id_activite
             WHERE ea.id_etape = ?'
        );
        $stmtAct->execute([$idEtape]);
        $rawActs = $stmtAct->fetchAll(PDO::FETCH_ASSOC);
        $activites = [];
        foreach ($rawActs as $act) {
            $activites[] = [
                'id_etape_activite' => (int) $act['id_etape_activite'],
                'nb_personnes'      => (int) $act['nb_personnes'],
                'prix_calcule'      => (float) $act['prix_calcule'],
                'date_heure'        => $act['date_heure'],
                'id_activite'       => (int) $act['id_activite'],
                'nom'               => $act['nom'],
                'description'       => $act['description'],
                'type'              => $act['type'],
                'prix_personne'     => (float) $act['prix_personne'],
                'duree_heures'      => $act['duree_heures'] !== null ? (float) $act['duree_heures'] : null,
                'capacite_max'      => (int) $act['capacite_max'],
                'places_disponibles'=> (int) $act['places_disponibles'],
                'photo_url'         => $act['photo_url'],
                'statut'            => $act['statut'],
                'id_destination'    => (int) $act['id_destination'],
                'id_prestataire'    => (int) $act['id_prestataire'],
            ];
        }

        // Calcul nuits
        $nuits = 1;
        if ($row['date_arrivee'] && $row['date_depart']) {
            $diff = (int) ((strtotime($row['date_depart']) - strtotime($row['date_arrivee'])) / 86400);
            $nuits = max(1, $diff);
        }

        $etapes[] = [
            'id_etape'    => $idEtape,
            'ordre'       => (int) $row['ordre'],
            'date_arrivee'=> $row['date_arrivee'],
            'date_depart' => $row['date_depart'],
            'nuits'       => $nuits,
            'destination' => $destination,
            'hebergement' => $hebergement,
            'transport'   => $transport,
            'activites'   => $activites,
        ];
    }

    $voyage['etapes'] = $etapes;
    return $voyage;
}

/**
 * Vérifie que le voyage appartient à l'utilisateur (ou admin), sinon 403/404.
 */
function assertVoyageOwner(int $idVoyage, int $userId, bool $isAdmin): void
{
    $stmt = db()->prepare('SELECT id_utilisateur FROM voyage WHERE id_voyage = ?');
    $stmt->execute([$idVoyage]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        Response::notFound('Voyage introuvable.');
    }
    if (!$isAdmin && (int) $row['id_utilisateur'] !== $userId) {
        Response::forbidden('Ce voyage ne vous appartient pas.');
    }
}

/**
 * Vérifie que l'étape appartient à un voyage de l'utilisateur.
 * Retourne l'id_voyage de l'étape.
 */
function assertEtapeOwner(int $idEtape, int $userId, bool $isAdmin): int
{
    $stmt = db()->prepare(
        'SELECT e.id_voyage, v.id_utilisateur
         FROM etape e JOIN voyage v ON v.id_voyage = e.id_voyage
         WHERE e.id_etape = ?'
    );
    $stmt->execute([$idEtape]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        Response::notFound('Étape introuvable.');
    }
    if (!$isAdmin && (int) $row['id_utilisateur'] !== $userId) {
        Response::forbidden('Cette étape ne vous appartient pas.');
    }
    return (int) $row['id_voyage'];
}

// -------------------------------------------------------------------------
// Dispatch routing
// -------------------------------------------------------------------------

$seg0 = $segments[0] ?? null; // premier segment après resource+id extraction
$seg1 = $segments[1] ?? null;
$seg2 = $segments[2] ?? null;

// Cas où $id a été extrait par index.php (numériques au bon endroit)
// Ex : /voyages/5         → $id=5, $seg0=null
// Ex : /voyages/5/etapes  → $id=5, $seg0='etapes'
// Ex : /voyages/panier    → $id=null, $seg0='panier'
// Ex : /voyages/etapes/3  → $id=null, $seg0='etapes', $seg1='3'
// Ex : /voyages/etapes/3/activites → $id=null, $seg0='etapes', $seg1='3', $seg2='activites'
// Ex : /voyages/activites/7 → $id=null, $seg0='activites', $seg1='7'

// ── GET /voyages/panier ──────────────────────────────────────────────────
if ($method === 'GET' && $id === null && $seg0 === 'panier') {

    // Cherche un brouillon existant
    $stmt = db()->prepare(
        'SELECT id_voyage FROM voyage
         WHERE id_utilisateur = ? AND statut = ? ORDER BY date_creation DESC LIMIT 1'
    );
    $stmt->execute([$userId, 'brouillon']);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        // Créer un brouillon vide
        $ins = db()->prepare(
            'INSERT INTO voyage (titre, statut, nb_voyageurs, prix_total, id_utilisateur)
             VALUES (?, ?, ?, ?, ?)'
        );
        $ins->execute(['Mon voyage', 'brouillon', 1, 0, $userId]);
        $idVoyage = (int) db()->lastInsertId();
    } else {
        $idVoyage = (int) $row['id_voyage'];
    }

    Response::ok(['voyage' => getVoyageDetaille($idVoyage)]);
}

// ── POST /voyages/etapes/:idEtape/activites ──────────────────────────────
if ($method === 'POST' && $id === null && $seg0 === 'etapes' && $seg1 !== null && $seg2 === 'activites') {
    $idEtape = (int) $seg1;
    $idVoyage = assertEtapeOwner($idEtape, $userId, $isAdmin);

    $data = body();
    require_fields($data, ['id_activite', 'nb_personnes']);
    $idActivite  = (int) $data['id_activite'];
    $nbPersonnes = max(1, (int) $data['nb_personnes']);
    $dateHeure   = $data['date_heure'] ?? null;

    // Récupérer prix_personne
    $stmtAct = db()->prepare('SELECT prix_personne FROM activite WHERE id_activite = ?');
    $stmtAct->execute([$idActivite]);
    $actRow = $stmtAct->fetch(PDO::FETCH_ASSOC);
    if (!$actRow) {
        Response::notFound('Activité introuvable.');
    }
    $prixCalcule = round((float) $actRow['prix_personne'] * $nbPersonnes, 2);

    $ins = db()->prepare(
        'INSERT INTO etape_activite (id_etape, id_activite, nb_personnes, prix_calcule, date_heure)
         VALUES (?, ?, ?, ?, ?)'
    );
    $ins->execute([$idEtape, $idActivite, $nbPersonnes, $prixCalcule, $dateHeure]);

    recomputePrixTotal($idVoyage);
    Response::created(['voyage' => getVoyageDetaille($idVoyage)]);
}

// ── DELETE /voyages/etapes/:idEtape ─────────────────────────────────────
if ($method === 'DELETE' && $id === null && $seg0 === 'etapes' && $seg1 !== null && $seg2 === null) {
    $idEtape = (int) $seg1;
    $idVoyage = assertEtapeOwner($idEtape, $userId, $isAdmin);

    $del = db()->prepare('DELETE FROM etape WHERE id_etape = ?');
    $del->execute([$idEtape]);

    recomputePrixTotal($idVoyage);
    Response::ok(['voyage' => getVoyageDetaille($idVoyage)]);
}

// ── PUT /voyages/etapes/:idEtape ─────────────────────────────────────────
if ($method === 'PUT' && $id === null && $seg0 === 'etapes' && $seg1 !== null) {
    $idEtape = (int) $seg1;
    $idVoyage = assertEtapeOwner($idEtape, $userId, $isAdmin);

    $data = body();
    $fields = [];
    $params = [];

    if (array_key_exists('id_transport', $data)) {
        $fields[] = 'id_transport = ?';
        $params[] = $data['id_transport'] !== null ? (int) $data['id_transport'] : null;
    }
    if (array_key_exists('id_hebergement', $data)) {
        $fields[] = 'id_hebergement = ?';
        $params[] = $data['id_hebergement'] !== null ? (int) $data['id_hebergement'] : null;
    }
    if (array_key_exists('date_arrivee', $data)) {
        $fields[] = 'date_arrivee = ?';
        $params[] = $data['date_arrivee'] ?: null;
    }
    if (array_key_exists('date_depart', $data)) {
        $fields[] = 'date_depart = ?';
        $params[] = $data['date_depart'] ?: null;
    }
    if (array_key_exists('ordre', $data)) {
        $fields[] = 'ordre = ?';
        $params[] = (int) $data['ordre'];
    }

    if (!empty($fields)) {
        $params[] = $idEtape;
        $upd = db()->prepare('UPDATE etape SET ' . implode(', ', $fields) . ' WHERE id_etape = ?');
        $upd->execute($params);
    }

    recomputePrixTotal($idVoyage);
    Response::ok(['voyage' => getVoyageDetaille($idVoyage)]);
}

// ── DELETE /voyages/activites/:idEtapeActivite ───────────────────────────
if ($method === 'DELETE' && $id === null && $seg0 === 'activites' && $seg1 !== null) {
    $idEtapeActivite = (int) $seg1;

    // Trouver l'id_voyage pour la vérification de propriété
    $stmt = db()->prepare(
        'SELECT ea.id_etape, v.id_voyage, v.id_utilisateur
         FROM etape_activite ea
         JOIN etape e   ON e.id_etape   = ea.id_etape
         JOIN voyage v  ON v.id_voyage  = e.id_voyage
         WHERE ea.id_etape_activite = ?'
    );
    $stmt->execute([$idEtapeActivite]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        Response::notFound('Activité d\'étape introuvable.');
    }
    if (!$isAdmin && (int) $row['id_utilisateur'] !== $userId) {
        Response::forbidden('Cette activité ne vous appartient pas.');
    }
    $idVoyage = (int) $row['id_voyage'];

    $del = db()->prepare('DELETE FROM etape_activite WHERE id_etape_activite = ?');
    $del->execute([$idEtapeActivite]);

    recomputePrixTotal($idVoyage);
    Response::ok(['voyage' => getVoyageDetaille($idVoyage)]);
}

// ── Routes avec $id extrait par index.php ────────────────────────────────

// POST /voyages/:id/etapes
if ($method === 'POST' && $id !== null && $seg0 === 'etapes') {
    assertVoyageOwner($id, $userId, $isAdmin);

    $data = body();
    require_fields($data, ['id_destination']);
    $idDest    = (int) $data['id_destination'];
    $ordre     = isset($data['ordre']) ? (int) $data['ordre'] : null;
    $dateArr   = $data['date_arrivee'] ?? null;
    $dateDep   = $data['date_depart']  ?? null;

    // Calculer l'ordre si non fourni
    if ($ordre === null) {
        $stmtOrd = db()->prepare('SELECT COALESCE(MAX(ordre), 0) + 1 FROM etape WHERE id_voyage = ?');
        $stmtOrd->execute([$id]);
        $ordre = (int) $stmtOrd->fetchColumn();
    }

    $ins = db()->prepare(
        'INSERT INTO etape (id_voyage, id_destination, ordre, date_arrivee, date_depart)
         VALUES (?, ?, ?, ?, ?)'
    );
    $ins->execute([$id, $idDest, $ordre, $dateArr ?: null, $dateDep ?: null]);

    recomputePrixTotal($id);
    Response::created(['voyage' => getVoyageDetaille($id)]);
}

// GET /voyages/:id (détail complet)
if ($method === 'GET' && $id !== null && $seg0 === null) {
    assertVoyageOwner($id, $userId, $isAdmin);
    Response::ok(['voyage' => getVoyageDetaille($id)]);
}

// PUT /voyages/:id
if ($method === 'PUT' && $id !== null && $seg0 === null) {
    assertVoyageOwner($id, $userId, $isAdmin);

    $data   = body();
    $fields = [];
    $params = [];

    if (isset($data['titre']) && $data['titre'] !== '') {
        $fields[] = 'titre = ?';
        $params[] = $data['titre'];
    }
    if (isset($data['nb_voyageurs'])) {
        $fields[] = 'nb_voyageurs = ?';
        $params[] = max(1, (int) $data['nb_voyageurs']);
    }

    if (!empty($fields)) {
        $params[] = $id;
        $upd = db()->prepare('UPDATE voyage SET ' . implode(', ', $fields) . ' WHERE id_voyage = ?');
        $upd->execute($params);
    }

    $stmt = db()->prepare('SELECT id_voyage, titre, statut, nb_voyageurs, prix_total FROM voyage WHERE id_voyage = ?');
    $stmt->execute([$id]);
    Response::ok(['voyage' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}

// DELETE /voyages/:id
if ($method === 'DELETE' && $id !== null && $seg0 === null) {
    assertVoyageOwner($id, $userId, $isAdmin);
    $del = db()->prepare('DELETE FROM voyage WHERE id_voyage = ?');
    $del->execute([$id]);
    Response::ok(['message' => 'Voyage supprimé.']);
}

// GET /voyages (liste)
if ($method === 'GET' && $id === null && $seg0 === null) {
    $stmt = db()->prepare(
        'SELECT id_voyage, titre, statut, nb_voyageurs, prix_total, date_creation
         FROM voyage WHERE id_utilisateur = ? ORDER BY date_creation DESC'
    );
    $stmt->execute([$userId]);
    $voyages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($voyages as &$v) {
        $v['id_voyage']    = (int) $v['id_voyage'];
        $v['nb_voyageurs'] = (int) $v['nb_voyageurs'];
        $v['prix_total']   = (float) $v['prix_total'];
    }
    Response::ok(['voyages' => $voyages]);
}

// POST /voyages (créer)
if ($method === 'POST' && $id === null && $seg0 === null) {
    $data = body();
    require_fields($data, ['titre']);
    $titre       = $data['titre'];
    $nbVoyageurs = max(1, (int) ($data['nb_voyageurs'] ?? 1));

    $ins = db()->prepare(
        'INSERT INTO voyage (titre, statut, nb_voyageurs, prix_total, id_utilisateur)
         VALUES (?, ?, ?, ?, ?)'
    );
    $ins->execute([$titre, 'brouillon', $nbVoyageurs, 0, $userId]);
    $idVoyage = (int) db()->lastInsertId();

    $stmt = db()->prepare('SELECT id_voyage, titre, statut, nb_voyageurs, prix_total FROM voyage WHERE id_voyage = ?');
    $stmt->execute([$idVoyage]);
    Response::created(['voyage' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}

Response::notFound('Endpoint voyages inconnu.');
