<?php
/**
 * Front controller de l'API VoyageVista.
 * Routage par convention : /api/{resource}/{id?}  ->  routes/{resource}.php
 *
 * Variables exposées aux fichiers de route :
 *   $method   : verbe HTTP (GET, POST, PUT, DELETE)
 *   $id       : identifiant numérique éventuel (ou null)
 *   $segments : segments de chemin après la ressource (tableau)
 *
 * Lancement (dev) :  php -S localhost:8000 api/index.php   (depuis voyagevista/)
 */

declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

// --- Session (cookie partagé avec le front via proxy Vite) ---
session_set_cookie_params(['samesite' => 'Lax', 'httponly' => true, 'path' => '/']);
session_start();

// --- CORS (utile si front servi sur une autre origine sans proxy) ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Auth.php';

// --- Parsing du chemin ---
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$path = preg_replace('#^/api#', '', $path);          // retire un éventuel préfixe /api
$path = trim($path, '/');
$segments = $path === '' ? [] : explode('/', $path);

$method   = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$resource = array_shift($segments) ?: '';
$id       = (isset($segments[0]) && ctype_digit($segments[0])) ? (int) array_shift($segments) : null;

if ($resource === '') {
    Response::ok(['service' => 'VoyageVista API', 'status' => 'ok']);
}

$routeFile = __DIR__ . '/routes/' . $resource . '.php';
if (!preg_match('/^[a-z_]+$/', $resource) || !file_exists($routeFile)) {
    Response::notFound("Route inconnue : /$resource");
}

require $routeFile;
