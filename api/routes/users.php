<?php
/**
 * Route USERS — /api/users/...
 *
 * Endpoints :
 *   GET  /api/users/me        profil complet du connecté (sans mot_de_passe)
 *   PUT  /api/users/me        modifie nom, prenom, telephone, photo_profil, mot_de_passe?
 *   GET  /api/users           (admin) liste tous les utilisateurs
 *
 * Variables disponibles (fournies par index.php) : $method, $id, $segments
 */

$action = $segments[0] ?? '';

switch ("$method $action") {

    // --- Profil du connecté ---
    case 'GET me':
        $session = Auth::requireLogin();
        $userId  = (int) $session['id_utilisateur'];

        $stmt = db()->prepare(
            'SELECT id_utilisateur, nom, prenom, email, telephone, role,
                    date_inscription, photo_profil, statut
             FROM utilisateur
             WHERE id_utilisateur = ?'
        );
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('Utilisateur introuvable.');
        }

        // Cast types
        $user['id_utilisateur'] = (int) $user['id_utilisateur'];

        Response::ok(['user' => $user]);
        break;

    // --- Mise à jour du profil ---
    case 'PUT me':
        $session = Auth::requireLogin();
        $userId  = (int) $session['id_utilisateur'];
        $data    = body();

        // Champs autorisés à modifier
        $allowed = ['nom', 'prenom', 'telephone', 'photo_profil', 'mot_de_passe'];
        $sets    = [];
        $params  = [];

        foreach ($allowed as $field) {
            if (!array_key_exists($field, $data)) {
                continue;
            }
            if ($field === 'mot_de_passe') {
                if ($data['mot_de_passe'] === null || $data['mot_de_passe'] === '') {
                    continue; // ignorer si vide
                }
                if (strlen($data['mot_de_passe']) < 6) {
                    Response::error('Le mot de passe doit contenir au moins 6 caractères.', 422);
                }
                $sets[]   = 'mot_de_passe = ?';
                $params[] = password_hash($data['mot_de_passe'], PASSWORD_BCRYPT);
            } else {
                $sets[]   = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($sets)) {
            Response::error('Aucun champ à mettre à jour.', 422);
        }

        $params[] = $userId;
        $sql      = 'UPDATE utilisateur SET ' . implode(', ', $sets) . ' WHERE id_utilisateur = ?';
        $stmt     = db()->prepare($sql);
        $stmt->execute($params);

        // Retourner le profil mis à jour (sans mot_de_passe)
        $stmt2 = db()->prepare(
            'SELECT id_utilisateur, nom, prenom, email, telephone, role,
                    date_inscription, photo_profil, statut
             FROM utilisateur
             WHERE id_utilisateur = ?'
        );
        $stmt2->execute([$userId]);
        $user = $stmt2->fetch();
        $user['id_utilisateur'] = (int) $user['id_utilisateur'];

        Response::ok(['user' => $user]);
        break;

    // --- Liste de tous les utilisateurs (admin) ---
    case 'GET ':
    case 'GET':
        Auth::requireRole('admin');

        $stmt = db()->prepare(
            'SELECT id_utilisateur, nom, prenom, email, telephone, role,
                    date_inscription, photo_profil, statut
             FROM utilisateur
             ORDER BY date_inscription DESC'
        );
        $stmt->execute();
        $users = $stmt->fetchAll();

        foreach ($users as &$u) {
            $u['id_utilisateur'] = (int) $u['id_utilisateur'];
        }
        unset($u);

        Response::ok(['users' => $users]);
        break;

    default:
        Response::notFound("Action users inconnue : $method /$action");
}
