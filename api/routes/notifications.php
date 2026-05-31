<?php
/**
 * Route NOTIFICATIONS — /api/notifications
 * Endpoints :
 *   GET    /notifications        liste de l'utilisateur connecté + compteur non lues
 *   PUT    /notifications/:id     marque une notification comme lue
 *   PUT    /notifications         marque TOUTES comme lues
 *   DELETE /notifications/:id     supprime une notification
 *   POST   /notifications         crée une notification (admin ou pour soi-même)
 */

$user = Auth::requireLogin();
$uid  = (int) $user['id_utilisateur'];

switch ($method) {

    case 'GET': {
        $stmt = db()->prepare(
            'SELECT * FROM notification WHERE id_utilisateur = ? ORDER BY date_creation DESC'
        );
        $stmt->execute([$uid]);
        $notifs = $stmt->fetchAll();

        $stmt = db()->prepare('SELECT COUNT(*) FROM notification WHERE id_utilisateur = ? AND est_lue = 0');
        $stmt->execute([$uid]);
        $nonLues = (int) $stmt->fetchColumn();

        Response::ok(['notifications' => $notifs, 'non_lues' => $nonLues]);
        break;
    }

    case 'PUT': {
        if ($id === null) {
            // Tout marquer comme lu
            $stmt = db()->prepare('UPDATE notification SET est_lue = 1 WHERE id_utilisateur = ?');
            $stmt->execute([$uid]);
            Response::ok(['message' => 'Toutes les notifications ont été marquées comme lues.']);
        } else {
            // Vérifier l'appartenance
            $stmt = db()->prepare('SELECT id_utilisateur FROM notification WHERE id_notification = ?');
            $stmt->execute([$id]);
            $owner = $stmt->fetchColumn();
            if ($owner === false) Response::notFound('Notification introuvable.');
            if ((int) $owner !== $uid) Response::forbidden();

            $stmt = db()->prepare('UPDATE notification SET est_lue = 1 WHERE id_notification = ?');
            $stmt->execute([$id]);
            Response::ok(['message' => 'Notification marquée comme lue.']);
        }
        break;
    }

    case 'DELETE': {
        if ($id === null) Response::error('Identifiant requis.', 422);
        $stmt = db()->prepare('SELECT id_utilisateur FROM notification WHERE id_notification = ?');
        $stmt->execute([$id]);
        $owner = $stmt->fetchColumn();
        if ($owner === false) Response::notFound('Notification introuvable.');
        if ((int) $owner !== $uid && $user['role'] !== 'admin') Response::forbidden();

        $stmt = db()->prepare('DELETE FROM notification WHERE id_notification = ?');
        $stmt->execute([$id]);
        Response::ok(['message' => 'Notification supprimée.']);
        break;
    }

    case 'POST': {
        $data = body();
        require_fields($data, ['titre', 'message']);

        // Un utilisateur normal ne peut créer une notif que pour lui-même.
        $cible = $uid;
        if (isset($data['id_utilisateur']) && $user['role'] === 'admin') {
            $cible = (int) $data['id_utilisateur'];
        }
        $type = in_array($data['type'] ?? '', ['reservation','modification','rappel','promotion','systeme'], true)
            ? $data['type'] : 'systeme';

        $stmt = db()->prepare(
            'INSERT INTO notification (titre, message, type, id_utilisateur, id_voyage)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['titre'], $data['message'], $type, $cible, $data['id_voyage'] ?? null,
        ]);
        Response::created(['id_notification' => (int) db()->lastInsertId()]);
        break;
    }

    default:
        Response::error('Méthode non supportée.', 405);
}
