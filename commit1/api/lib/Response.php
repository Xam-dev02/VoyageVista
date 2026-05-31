<?php
/**
 * Helpers de réponse JSON normalisés pour toute l'API.
 */
class Response
{
    public static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function ok($data = [], int $code = 200): void
    {
        self::json($data, $code);
    }

    public static function created($data = []): void
    {
        self::json($data, 201);
    }

    public static function error(string $message, int $code = 400, array $extra = []): void
    {
        self::json(array_merge(['error' => $message], $extra), $code);
    }

    public static function notFound(string $message = 'Ressource introuvable.'): void
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'Authentification requise.'): void
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Accès refusé.'): void
    {
        self::error($message, 403);
    }
}

/**
 * Récupère et décode le corps JSON de la requête.
 */
function body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Valide la présence de champs requis dans un tableau de données.
 * Renvoie une erreur 422 si un champ manque.
 */
function require_fields(array $data, array $fields): void
{
    $missing = [];
    foreach ($fields as $f) {
        if (!isset($data[$f]) || $data[$f] === '') {
            $missing[] = $f;
        }
    }
    if ($missing) {
        Response::error('Champs requis manquants : ' . implode(', ', $missing), 422, ['champs' => $missing]);
    }
}
