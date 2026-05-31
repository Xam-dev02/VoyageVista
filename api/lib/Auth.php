<?php
/**
 * Gestion de l'authentification par session PHP.
 * Stocke l'utilisateur connecté en session et fournit des gardes de rôle.
 */
class Auth
{
    /** Connecte un utilisateur (stocke ses infos en session). */
    public static function login(array $user): void
    {
        $_SESSION['user'] = [
            'id_utilisateur' => (int) $user['id_utilisateur'],
            'nom'            => $user['nom'],
            'prenom'         => $user['prenom'],
            'email'          => $user['email'],
            'role'           => $user['role'],
        ];
    }

    public static function logout(): void
    {
        unset($_SESSION['user']);
        session_destroy();
    }

    /** Retourne l'utilisateur connecté ou null. */
    public static function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    public static function id(): ?int
    {
        return $_SESSION['user']['id_utilisateur'] ?? null;
    }

    public static function check(): bool
    {
        return isset($_SESSION['user']);
    }

    /** Exige une session active, sinon 401. */
    public static function requireLogin(): array
    {
        if (!self::check()) {
            Response::unauthorized();
        }
        return self::user();
    }

    /** Exige un rôle précis (ou l'un des rôles fournis), sinon 403. */
    public static function requireRole(string ...$roles): array
    {
        $user = self::requireLogin();
        if (!in_array($user['role'], $roles, true)) {
            Response::forbidden('Rôle requis : ' . implode(' ou ', $roles));
        }
        return $user;
    }
}
