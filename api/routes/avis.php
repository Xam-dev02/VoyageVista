<?php
/**
 * Route AVIS — /api/avis/:id?
 *
 * GET    /api/avis               params: type_cible, id_cible → {avis:[...], note_moyenne}
 * POST   /api/avis               (connecté) {note, commentaire, type_cible, id_hebergement?|id_activite?|id_destination?}
 * DELETE /api/avis/:id           (auteur ou admin)
 *
 * Variables fournies par index.php : $method, $id, $segments
 */

switch ($method) {

    // ─── GET /avis?type_cible=…&id_cible=… ───────────────────────────────────
    case 'GET':
        $type_cible = $_GET['type_cible'] ?? '';
        $id_cible   = isset($_GET['id_cible']) ? (int) $_GET['id_cible'] : null;

        $types_valides = ['hebergement', 'activite', 'destination'];
        if (!in_array($type_cible, $types_valides, true) || !$id_cible) {
            Response::error('Paramètres type_cible et id_cible requis.', 422);
        }

        // Colonne cible selon le type
        $col_map = [
            'hebergement'  => 'id_hebergement',
            'activite'     => 'id_activite',
            'destination'  => 'id_destination',
        ];
        $col = $col_map[$type_cible];

        $stmt = db()->prepare(
            "SELECT a.id_avis, a.note, a.commentaire, a.date_avis, a.type_cible,
                    a.id_utilisateur, a.id_hebergement, a.id_activite, a.id_destination,
                    u.nom AS auteur_nom, u.prenom AS auteur_prenom
             FROM avis a
             JOIN utilisateur u ON u.id_utilisateur = a.id_utilisateur
             WHERE a.type_cible = ? AND a.$col = ?
             ORDER BY a.date_avis DESC"
        );
        $stmt->execute([$type_cible, $id_cible]);
        $avis = $stmt->fetchAll();

        // Convertir les types
        foreach ($avis as &$av) {
            $av['id_avis']          = (int) $av['id_avis'];
            $av['note']             = (int) $av['note'];
            $av['id_utilisateur']   = (int) $av['id_utilisateur'];
            $av['id_hebergement']   = $av['id_hebergement'] ? (int) $av['id_hebergement'] : null;
            $av['id_activite']      = $av['id_activite']    ? (int) $av['id_activite']    : null;
            $av['id_destination']   = $av['id_destination'] ? (int) $av['id_destination'] : null;
        }
        unset($av);

        $note_moyenne = count($avis) > 0
            ? round(array_sum(array_column($avis, 'note')) / count($avis), 1)
            : null;

        Response::ok(['avis' => $avis, 'note_moyenne' => $note_moyenne]);
        break;

    // ─── POST /avis ───────────────────────────────────────────────────────────
    case 'POST':
        $user = Auth::requireLogin();
        $data = body();

        require_fields($data, ['note', 'commentaire', 'type_cible']);

        $note = (int) ($data['note'] ?? 0);
        if ($note < 1 || $note > 5) {
            Response::error('La note doit être comprise entre 1 et 5.', 422);
        }

        $types_valides = ['hebergement', 'activite', 'destination'];
        if (!in_array($data['type_cible'], $types_valides, true)) {
            Response::error('type_cible invalide.', 422);
        }

        $id_hebergement  = isset($data['id_hebergement'])  ? (int) $data['id_hebergement']  : null;
        $id_activite     = isset($data['id_activite'])     ? (int) $data['id_activite']     : null;
        $id_destination  = isset($data['id_destination'])  ? (int) $data['id_destination']  : null;

        // Vérifier qu'au moins l'identifiant correspondant au type est fourni
        if ($data['type_cible'] === 'hebergement' && !$id_hebergement) {
            Response::error('id_hebergement requis pour ce type.', 422);
        }
        if ($data['type_cible'] === 'activite' && !$id_activite) {
            Response::error('id_activite requis pour ce type.', 422);
        }
        if ($data['type_cible'] === 'destination' && !$id_destination) {
            Response::error('id_destination requis pour ce type.', 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO avis (note, commentaire, type_cible, id_utilisateur, id_hebergement, id_activite, id_destination)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $note,
            trim($data['commentaire']),
            $data['type_cible'],
            $user['id_utilisateur'],
            $id_hebergement,
            $id_activite,
            $id_destination,
        ]);
        $new_id = (int) db()->lastInsertId();

        $stmt = db()->prepare(
            'SELECT a.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom
             FROM avis a
             JOIN utilisateur u ON u.id_utilisateur = a.id_utilisateur
             WHERE a.id_avis = ?'
        );
        $stmt->execute([$new_id]);
        $avis = $stmt->fetch();
        $avis['id_avis']        = (int) $avis['id_avis'];
        $avis['note']           = (int) $avis['note'];
        $avis['id_utilisateur'] = (int) $avis['id_utilisateur'];

        Response::created(['avis' => $avis]);
        break;

    // ─── DELETE /avis/:id ─────────────────────────────────────────────────────
    case 'DELETE':
        if (!$id) {
            Response::error('Identifiant d\'avis requis.', 422);
        }

        $user = Auth::requireLogin();

        $stmt = db()->prepare('SELECT * FROM avis WHERE id_avis = ?');
        $stmt->execute([$id]);
        $avis = $stmt->fetch();

        if (!$avis) {
            Response::notFound('Avis introuvable.');
        }

        // Seul l'auteur ou un admin peut supprimer
        if ((int) $avis['id_utilisateur'] !== $user['id_utilisateur'] && $user['role'] !== 'admin') {
            Response::forbidden('Vous ne pouvez pas supprimer cet avis.');
        }

        $stmt = db()->prepare('DELETE FROM avis WHERE id_avis = ?');
        $stmt->execute([$id]);

        Response::ok(['message' => 'Avis supprimé.']);
        break;

    default:
        Response::error('Méthode non supportée.', 405);
}
