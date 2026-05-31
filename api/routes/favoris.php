<?php
/**
 * Route FAVORIS — /api/favoris
 *
 * GET    /favoris            → destinations favorites de l'utilisateur connecté
 * POST   /favoris            → ajoute un favori  { id_destination }
 * DELETE /favoris/:id_dest   → retire un favori
 */

$user = Auth::requireLogin();
$uid  = (int) $user['id_utilisateur'];

switch ($method) {

    case 'GET': {
        $stmt = db()->prepare(
            'SELECT d.*
             FROM favori f
             JOIN destination d ON d.id_destination = f.id_destination
             WHERE f.id_utilisateur = ?
             ORDER BY f.date_ajout DESC'
        );
        $stmt->execute([$uid]);
        $destinations = $stmt->fetchAll();
        foreach ($destinations as &$d) { $d['id_destination'] = (int) $d['id_destination']; }
        Response::ok(['destinations' => $destinations]);
        break;
    }

    case 'POST': {
        $data = body();
        require_fields($data, ['id_destination']);
        $idDest = (int) $data['id_destination'];

        // INSERT IGNORE pour éviter les doublons (clé unique)
        $stmt = db()->prepare(
            'INSERT IGNORE INTO favori (id_utilisateur, id_destination) VALUES (?, ?)'
        );
        $stmt->execute([$uid, $idDest]);
        Response::created(['message' => 'Favori ajouté.', 'id_destination' => $idDest]);
        break;
    }

    case 'DELETE': {
        if ($id === null) {
            Response::error('Identifiant de destination requis.', 400);
        }
        $stmt = db()->prepare('DELETE FROM favori WHERE id_utilisateur = ? AND id_destination = ?');
        $stmt->execute([$uid, $id]);
        Response::ok(['message' => 'Favori retiré.', 'id_destination' => $id]);
        break;
    }

    default:
        Response::error('Méthode non supportée.', 405);
}
