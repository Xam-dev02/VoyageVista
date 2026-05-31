<?php
/**
 * Route AUTH — /api/auth/...
 * Sert aussi de MODÈLE de référence pour les autres fichiers de route.
 *
 * Endpoints :
 *   POST   /api/auth/register   { nom, prenom, email, mot_de_passe, role? }
 *   POST   /api/auth/login      { email, mot_de_passe }
 *   POST   /api/auth/logout
 *   GET    /api/auth/me
 *
 * Variables disponibles (fournies par index.php) : $method, $id, $segments
 */

$action = $segments[0] ?? '';

switch ("$method $action") {

    // --- Inscription ---
    case 'POST register':
        $data = body();
        require_fields($data, ['nom', 'prenom', 'email', 'mot_de_passe']);

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Adresse e-mail invalide.', 422);
        }
        if (strlen($data['mot_de_passe']) < 6) {
            Response::error('Le mot de passe doit contenir au moins 6 caractères.', 422);
        }

        $role = in_array($data['role'] ?? '', ['voyageur', 'prestataire'], true)
            ? $data['role'] : 'voyageur';   // 'admin' jamais auto-attribué

        $stmt = db()->prepare('SELECT id_utilisateur FROM utilisateur WHERE email = ?');
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            Response::error('Cet e-mail est déjà utilisé.', 409);
        }

        $hash = password_hash($data['mot_de_passe'], PASSWORD_BCRYPT);
        $stmt = db()->prepare(
            'INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, telephone, role)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['nom'], $data['prenom'], $data['email'],
            $hash, $data['telephone'] ?? null, $role,
        ]);
        $userId = (int) db()->lastInsertId();

        $user = db()->query("SELECT id_utilisateur, nom, prenom, email, role FROM utilisateur WHERE id_utilisateur = $userId")->fetch();
        Auth::login($user);
        Response::created(['user' => $user]);
        break;

    // --- Connexion ---
    case 'POST login':
        $data = body();
        require_fields($data, ['email', 'mot_de_passe']);

        $stmt = db()->prepare('SELECT * FROM utilisateur WHERE email = ?');
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['mot_de_passe'], $user['mot_de_passe'])) {
            Response::error('E-mail ou mot de passe incorrect.', 401);
        }
        if ($user['statut'] !== 'actif') {
            Response::forbidden('Compte désactivé.');
        }

        Auth::login($user);
        Response::ok(['user' => [
            'id_utilisateur' => (int) $user['id_utilisateur'],
            'nom'    => $user['nom'],
            'prenom' => $user['prenom'],
            'email'  => $user['email'],
            'role'   => $user['role'],
        ]]);
        break;

    // --- Déconnexion ---
    case 'POST logout':
        Auth::logout();
        Response::ok(['message' => 'Déconnecté.']);
        break;

    // --- Utilisateur courant ---
    case 'GET me':
        $u = Auth::user();
        Response::ok(['user' => $u]);
        break;

    default:
        Response::notFound("Action auth inconnue : $method /$action");
}
