<?php
/**
 * Route PRESTATAIRE — /api/prestataire/...
 *
 * GET /prestataire/stats         → statistiques du prestataire connecté
 * GET /prestataire/offres        → toutes ses offres (tous statuts)
 * GET /prestataire/reservations  → réservations sur ses offres
 * GET /prestataire/avis          → avis sur ses offres
 */

$user = Auth::requireRole('prestataire', 'admin');
$uid  = (int) $user['id_utilisateur'];
$action = $segments[0] ?? '';

switch ($action) {

    /* ── Stats ─────────────────────────────────────────────────────── */
    case 'stats':
        $db = db();

        $s = $db->prepare("SELECT COUNT(*) FROM hebergement WHERE id_prestataire = ? AND statut='disponible'");
        $s->execute([$uid]); $heb = (int)$s->fetchColumn();

        $s = $db->prepare("SELECT COUNT(*) FROM activite WHERE id_prestataire = ? AND statut='disponible'");
        $s->execute([$uid]); $act = (int)$s->fetchColumn();

        $s = $db->prepare("SELECT COUNT(*) FROM transport WHERE id_prestataire = ?");
        $s->execute([$uid]); $tra = (int)$s->fetchColumn();

        // Réservations confirmées ce mois impliquant une offre du prestataire
        $s = $db->prepare("
            SELECT COUNT(DISTINCT r.id_reservation)
            FROM reservation r
            JOIN voyage v ON v.id_voyage = r.id_voyage
            JOIN etape e  ON e.id_voyage = v.id_voyage
            WHERE r.statut = 'confirmee'
              AND MONTH(r.date_reservation) = MONTH(CURDATE())
              AND YEAR(r.date_reservation)  = YEAR(CURDATE())
              AND (
                e.id_hebergement IN (SELECT id_hebergement FROM hebergement WHERE id_prestataire = ?)
                OR e.id_transport IN (SELECT id_transport  FROM transport  WHERE id_prestataire = ?)
                OR e.id_etape IN (
                    SELECT ea.id_etape FROM etape_activite ea
                    JOIN activite a ON a.id_activite = ea.id_activite
                    WHERE a.id_prestataire = ?
                )
              )
        ");
        $s->execute([$uid, $uid, $uid]);
        $resaMois = (int)$s->fetchColumn();

        // Note moyenne sur ses hébergements et activités
        $s = $db->prepare("
            SELECT ROUND(AVG(note), 1) FROM avis
            WHERE (type_cible = 'hebergement' AND id_hebergement IN (SELECT id_hebergement FROM hebergement WHERE id_prestataire = ?))
               OR (type_cible = 'activite'    AND id_activite    IN (SELECT id_activite    FROM activite    WHERE id_prestataire = ?))
        ");
        $s->execute([$uid, $uid]);
        $note = $s->fetchColumn();

        Response::ok([
            'offres_actives'    => $heb + $act + $tra,
            'reservations_mois' => $resaMois,
            'note_moyenne'      => $note !== null ? (float)$note : null,
        ]);
        break;

    /* ── Offres (tous statuts) ──────────────────────────────────────── */
    case 'offres':
        $db = db();
        $offres = [];

        $s = $db->prepare("SELECT id_hebergement AS id, nom, type, prix_nuit AS prix, statut, 'hebergement' AS categorie FROM hebergement WHERE id_prestataire = ? ORDER BY nom");
        $s->execute([$uid]);
        foreach ($s->fetchAll() as $r) { $r['id']=(int)$r['id']; $r['prix']=(float)$r['prix']; $offres[] = $r; }

        $s = $db->prepare("SELECT id_activite AS id, nom, type, prix_personne AS prix, statut, 'activite' AS categorie FROM activite WHERE id_prestataire = ? ORDER BY nom");
        $s->execute([$uid]);
        foreach ($s->fetchAll() as $r) { $r['id']=(int)$r['id']; $r['prix']=(float)$r['prix']; $offres[] = $r; }

        $s = $db->prepare("SELECT id_transport AS id, CONCAT(compagnie,' ',numero) AS nom, type, prix, 'disponible' AS statut, 'transport' AS categorie FROM transport WHERE id_prestataire = ? ORDER BY compagnie");
        $s->execute([$uid]);
        foreach ($s->fetchAll() as $r) { $r['id']=(int)$r['id']; $r['prix']=(float)$r['prix']; $offres[] = $r; }

        Response::ok(['offres' => $offres]);
        break;

    /* ── Réservations ───────────────────────────────────────────────── */
    case 'reservations':
        $s = db()->prepare("
            SELECT DISTINCT r.reference, r.statut, r.montant_total, r.date_reservation,
                   v.titre AS voyage_titre,
                   CONCAT(u.prenom,' ',u.nom) AS voyageur
            FROM reservation r
            JOIN voyage v     ON v.id_voyage      = r.id_voyage
            JOIN utilisateur u ON u.id_utilisateur = r.id_utilisateur
            JOIN etape e      ON e.id_voyage       = v.id_voyage
            WHERE (
                e.id_hebergement IN (SELECT id_hebergement FROM hebergement WHERE id_prestataire = ?)
                OR e.id_transport IN (SELECT id_transport  FROM transport  WHERE id_prestataire = ?)
                OR e.id_etape IN (
                    SELECT ea.id_etape FROM etape_activite ea
                    JOIN activite a ON a.id_activite = ea.id_activite
                    WHERE a.id_prestataire = ?
                )
            )
            ORDER BY r.date_reservation DESC LIMIT 50
        ");
        $s->execute([$uid, $uid, $uid]);
        $rows = $s->fetchAll();
        foreach ($rows as &$r) { $r['montant_total'] = (float)$r['montant_total']; }
        Response::ok(['reservations' => $rows]);
        break;

    /* ── Avis ───────────────────────────────────────────────────────── */
    case 'avis':
        $s = db()->prepare("
            SELECT av.note, av.commentaire, av.date_avis, av.type_cible,
                   CONCAT(u.prenom,' ',u.nom) AS auteur,
                   COALESCE(h.nom, a.nom) AS offre_nom
            FROM avis av
            JOIN utilisateur u ON u.id_utilisateur = av.id_utilisateur
            LEFT JOIN hebergement h ON h.id_hebergement = av.id_hebergement
            LEFT JOIN activite    a ON a.id_activite    = av.id_activite
            WHERE (av.type_cible='hebergement' AND av.id_hebergement IN (SELECT id_hebergement FROM hebergement WHERE id_prestataire=?))
               OR (av.type_cible='activite'    AND av.id_activite    IN (SELECT id_activite    FROM activite    WHERE id_prestataire=?))
            ORDER BY av.date_avis DESC
        ");
        $s->execute([$uid, $uid]);
        $avis = $s->fetchAll();
        foreach ($avis as &$av) { $av['note'] = (int)$av['note']; }
        Response::ok(['avis' => $avis]);
        break;

    default:
        Response::notFound("Action prestataire inconnue : $action");
}
