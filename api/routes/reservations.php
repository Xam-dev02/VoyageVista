<?php
/**
 * Route RESERVATIONS — /api/reservations/...
 *
 * GET    /api/reservations          -> liste des réservations de l'utilisateur courant
 * GET    /api/reservations/:id      -> détail d'une réservation
 * POST   /api/reservations          -> confirme un voyage (paiement simulé)
 * PUT    /api/reservations/:id      -> modifie la méthode de paiement
 * DELETE /api/reservations/:id      -> annule la réservation
 */

$user = Auth::requireLogin();
$uid  = $user['id_utilisateur'];

switch ($method) {

    // ---------------------------------------------------------------
    // GET /reservations        -> liste
    // GET /reservations/:id    -> détail
    // ---------------------------------------------------------------
    case 'GET':
        if ($id === null) {
            // Liste des réservations de l'utilisateur
            $stmt = db()->prepare(
                'SELECT r.*, v.titre AS voyage_titre
                 FROM reservation r
                 JOIN voyage v ON v.id_voyage = r.id_voyage
                 WHERE r.id_utilisateur = ?
                 ORDER BY r.date_reservation DESC'
            );
            $stmt->execute([$uid]);
            $rows = $stmt->fetchAll();
            // Ne jamais renvoyer les infos_paiement complètes dans la liste
            foreach ($rows as &$row) {
                $row['id_reservation']   = (int) $row['id_reservation'];
                $row['id_voyage']        = (int) $row['id_voyage'];
                $row['id_utilisateur']   = (int) $row['id_utilisateur'];
                $row['montant_total']    = (float) $row['montant_total'];
            }
            unset($row);
            Response::ok(['reservations' => $rows]);
        } else {
            // Détail d'une réservation
            $stmt = db()->prepare(
                'SELECT r.*, v.titre AS voyage_titre
                 FROM reservation r
                 JOIN voyage v ON v.id_voyage = r.id_voyage
                 WHERE r.id_reservation = ? AND r.id_utilisateur = ?'
            );
            $stmt->execute([$id, $uid]);
            $resa = $stmt->fetch();
            if (!$resa) {
                Response::notFound('Réservation introuvable.');
            }
            $resa['id_reservation'] = (int) $resa['id_reservation'];
            $resa['id_voyage']      = (int) $resa['id_voyage'];
            $resa['id_utilisateur'] = (int) $resa['id_utilisateur'];
            $resa['montant_total']  = (float) $resa['montant_total'];
            Response::ok(['reservation' => $resa]);
        }
        break;

    // ---------------------------------------------------------------
    // POST /reservations  — confirmation + paiement simulé
    // ---------------------------------------------------------------
    case 'POST':
        $data = body();
        require_fields($data, ['id_voyage', 'methode_paiement', 'infos_paiement']);

        $idVoyage        = (int) $data['id_voyage'];
        $methodePaiement = $data['methode_paiement'];
        $infosPaiement   = $data['infos_paiement'] ?? [];

        // Valider methode_paiement
        if (!in_array($methodePaiement, ['carte', 'paypal', 'virement'], true)) {
            Response::error('Méthode de paiement invalide (carte, paypal ou virement).', 422);
        }

        // Vérifier que le voyage appartient à l'utilisateur
        $stmt = db()->prepare(
            'SELECT * FROM voyage WHERE id_voyage = ? AND id_utilisateur = ?'
        );
        $stmt->execute([$idVoyage, $uid]);
        $voyage = $stmt->fetch();
        if (!$voyage) {
            Response::notFound('Voyage introuvable ou accès refusé.');
        }

        // Vérifier que le voyage a au moins une étape
        $stmt = db()->prepare('SELECT COUNT(*) AS nb FROM etape WHERE id_voyage = ?');
        $stmt->execute([$idVoyage]);
        $nbEtapes = (int) $stmt->fetchColumn();
        if ($nbEtapes === 0) {
            Response::error('Itinéraire vide', 422);
        }

        // Vérifier les places disponibles sur les transports référencés
        $stmt = db()->prepare(
            'SELECT t.id_transport, t.places_disponibles, t.compagnie
             FROM etape e
             JOIN transport t ON t.id_transport = e.id_transport
             WHERE e.id_voyage = ? AND e.id_transport IS NOT NULL'
        );
        $stmt->execute([$idVoyage]);
        $transports = $stmt->fetchAll();
        foreach ($transports as $t) {
            if ((int) $t['places_disponibles'] < 1) {
                Response::error(
                    'Plus de places disponibles pour le transport ' . $t['compagnie'] . '.',
                    422
                );
            }
        }

        // Vérifier les places disponibles sur les activités
        $stmt = db()->prepare(
            'SELECT a.id_activite, a.nom, a.places_disponibles, ea.nb_personnes
             FROM etape e
             JOIN etape_activite ea ON ea.id_etape = e.id_etape
             JOIN activite a ON a.id_activite = ea.id_activite
             WHERE e.id_voyage = ?'
        );
        $stmt->execute([$idVoyage]);
        $activites = $stmt->fetchAll();
        foreach ($activites as $a) {
            if ((int) $a['places_disponibles'] < (int) $a['nb_personnes']) {
                Response::error(
                    'Plus assez de places disponibles pour l\'activité ' . $a['nom'] . '.',
                    422
                );
            }
        }

        // Générer une référence unique VV-2026-XXXXXX
        do {
            $reference = 'VV-2026-' . str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $stmtRef = db()->prepare('SELECT id_reservation FROM reservation WHERE reference = ?');
            $stmtRef->execute([$reference]);
        } while ($stmtRef->fetch());

        // Masquer les infos carte (garder les 4 derniers chiffres, jamais le CVV)
        $infosSecurisees = [];
        if (isset($infosPaiement['titulaire'])) {
            $infosSecurisees['titulaire'] = $infosPaiement['titulaire'];
        }
        if (isset($infosPaiement['numero'])) {
            $numero = preg_replace('/\s+/', '', $infosPaiement['numero']);
            $infosSecurisees['numero_masque'] = '**** **** **** ' . substr($numero, -4);
        }
        if (isset($infosPaiement['expiration'])) {
            $infosSecurisees['expiration'] = $infosPaiement['expiration'];
        }
        // cvv NON stocké intentionnellement

        $montantTotal = (float) $voyage['prix_total'];

        // Insérer la réservation
        $stmt = db()->prepare(
            'INSERT INTO reservation
             (reference, statut, montant_total, methode_paiement, infos_paiement, id_voyage, id_utilisateur)
             VALUES (?, \'confirmee\', ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $reference,
            $montantTotal,
            $methodePaiement,
            json_encode($infosSecurisees, JSON_UNESCAPED_UNICODE),
            $idVoyage,
            $uid,
        ]);
        $idReservation = (int) db()->lastInsertId();

        // Passer le voyage en statut 'confirme'
        $stmt = db()->prepare("UPDATE voyage SET statut = 'confirme' WHERE id_voyage = ?");
        $stmt->execute([$idVoyage]);

        // Décrémenter les places disponibles sur les transports
        foreach ($transports as $t) {
            $stmt = db()->prepare(
                'UPDATE transport
                 SET places_disponibles = GREATEST(0, places_disponibles - 1)
                 WHERE id_transport = ?'
            );
            $stmt->execute([$t['id_transport']]);
        }

        // Décrémenter les places disponibles sur les activités (+ passer complet si épuisé)
        foreach ($activites as $a) {
            $stmt = db()->prepare(
                'UPDATE activite
                 SET places_disponibles = GREATEST(0, places_disponibles - ?),
                     statut = IF(GREATEST(0, places_disponibles - ?) = 0, \'complet\', statut)
                 WHERE id_activite = ?'
            );
            $stmt->execute([(int) $a['nb_personnes'], (int) $a['nb_personnes'], $a['id_activite']]);
        }

        // Insérer une notification de confirmation
        $msgNotif = "Votre réservation $reference a été confirmée. Bon voyage !";
        $stmt = db()->prepare(
            'INSERT INTO notification (titre, message, type, id_utilisateur, id_voyage)
             VALUES (\'Réservation confirmée\', ?, \'reservation\', ?, ?)'
        );
        $stmt->execute([$msgNotif, $uid, $idVoyage]);

        // Retourner la réservation créée
        $stmt = db()->prepare(
            'SELECT r.*, v.titre AS voyage_titre
             FROM reservation r
             JOIN voyage v ON v.id_voyage = r.id_voyage
             WHERE r.id_reservation = ?'
        );
        $stmt->execute([$idReservation]);
        $resa = $stmt->fetch();
        $resa['id_reservation'] = (int) $resa['id_reservation'];
        $resa['id_voyage']      = (int) $resa['id_voyage'];
        $resa['id_utilisateur'] = (int) $resa['id_utilisateur'];
        $resa['montant_total']  = (float) $resa['montant_total'];

        Response::created(['reservation' => $resa]);
        break;

    // ---------------------------------------------------------------
    // PUT /reservations/:id  — modifier la méthode de paiement
    // ---------------------------------------------------------------
    case 'PUT':
        if ($id === null) {
            Response::error('Identifiant de réservation requis.', 400);
        }

        // Vérifier la propriété
        $stmt = db()->prepare(
            'SELECT * FROM reservation WHERE id_reservation = ? AND id_utilisateur = ?'
        );
        $stmt->execute([$id, $uid]);
        $resa = $stmt->fetch();
        if (!$resa) {
            Response::notFound('Réservation introuvable.');
        }
        if ($resa['statut'] === 'annulee') {
            Response::error('Impossible de modifier une réservation annulée.', 422);
        }

        $data = body();
        $updates = [];
        $params  = [];

        if (isset($data['methode_paiement'])) {
            if (!in_array($data['methode_paiement'], ['carte', 'paypal', 'virement'], true)) {
                Response::error('Méthode de paiement invalide.', 422);
            }
            $updates[] = 'methode_paiement = ?';
            $params[]  = $data['methode_paiement'];
        }

        if (empty($updates)) {
            Response::error('Aucune modification fournie.', 400);
        }

        $params[] = $id;
        $stmt = db()->prepare('UPDATE reservation SET ' . implode(', ', $updates) . ' WHERE id_reservation = ?');
        $stmt->execute($params);

        $stmt = db()->prepare(
            'SELECT r.*, v.titre AS voyage_titre
             FROM reservation r
             JOIN voyage v ON v.id_voyage = r.id_voyage
             WHERE r.id_reservation = ?'
        );
        $stmt->execute([$id]);
        $updated = $stmt->fetch();
        $updated['id_reservation'] = (int) $updated['id_reservation'];
        $updated['id_voyage']      = (int) $updated['id_voyage'];
        $updated['id_utilisateur'] = (int) $updated['id_utilisateur'];
        $updated['montant_total']  = (float) $updated['montant_total'];

        Response::ok(['reservation' => $updated]);
        break;

    // ---------------------------------------------------------------
    // DELETE /reservations/:id  — annuler
    // ---------------------------------------------------------------
    case 'DELETE':
        if ($id === null) {
            Response::error('Identifiant de réservation requis.', 400);
        }

        // Vérifier la propriété
        $stmt = db()->prepare(
            'SELECT * FROM reservation WHERE id_reservation = ? AND id_utilisateur = ?'
        );
        $stmt->execute([$id, $uid]);
        $resa = $stmt->fetch();
        if (!$resa) {
            Response::notFound('Réservation introuvable.');
        }
        if ($resa['statut'] === 'annulee') {
            Response::error('Réservation déjà annulée.', 422);
        }

        // Passer la réservation en 'annulee'
        $stmt = db()->prepare("UPDATE reservation SET statut = 'annulee' WHERE id_reservation = ?");
        $stmt->execute([$id]);

        // Passer le voyage en 'annule'
        $stmt = db()->prepare("UPDATE voyage SET statut = 'annule' WHERE id_voyage = ?");
        $stmt->execute([$resa['id_voyage']]);

        // Insérer une notification d'annulation
        $reference = $resa['reference'];
        $msgNotif  = "Votre réservation $reference a été annulée.";
        $stmt = db()->prepare(
            'INSERT INTO notification (titre, message, type, id_utilisateur, id_voyage)
             VALUES (\'Réservation annulée\', ?, \'reservation\', ?, ?)'
        );
        $stmt->execute([$msgNotif, $uid, $resa['id_voyage']]);

        Response::ok(['message' => 'Réservation annulée avec succès.', 'reference' => $reference]);
        break;

    default:
        Response::error('Méthode non supportée', 405);
}
