<?php
/**
 * Connexion à la base de données MySQL (PDO).
 * Valeurs par défaut adaptées à MAMP (port 8889, root/root).
 * Surchargeables via variables d'environnement.
 */

const DB_HOST = '127.0.0.1';
const DB_PORT = '8889';        // MAMP : 8889 — XAMPP/Linux : 3306
const DB_NAME = 'voyagevista';
const DB_USER = 'root';
const DB_PASS = 'root';

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: DB_HOST;
    $port = getenv('DB_PORT') ?: DB_PORT;
    $name = getenv('DB_NAME') ?: DB_NAME;
    $user = getenv('DB_USER') ?: DB_USER;
    $pass = getenv('DB_PASS') ?: DB_PASS;

    $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'error'   => 'Connexion à la base de données impossible.',
            'detail'  => $e->getMessage(),
        ]);
        exit;
    }
    return $pdo;
}
