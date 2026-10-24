<?php
declare(strict_types=1);

require_once __DIR__ . '/http.php';

requireMethod('POST');
requireCsrfProtection();

$cookieParams = session_get_cookie_params();
$_SESSION = [];
if (ini_get('session.use_cookies')) {
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $cookieParams['path'],
        'domain' => $cookieParams['domain'],
        'secure' => $cookieParams['secure'],
        'httponly' => $cookieParams['httponly'],
        'samesite' => $cookieParams['samesite'] ?? 'Lax',
    ]);
}
session_destroy();

jsonResponse(200, ['authenticated' => false]);
