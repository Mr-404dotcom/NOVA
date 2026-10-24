<?php
declare(strict_types=1);

require_once __DIR__ . '/http.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET') {
    startApiSession();
    jsonResponse(200, [
        'authenticated' => !empty($_SESSION['admin_authenticated']),
        'csrfToken' => csrfToken(),
    ]);
}

requireMethod('POST');

global $allowedOrigin, $requestOrigin;
if ($requestOrigin !== $allowedOrigin) {
    jsonResponse(403, ['error' => 'Request origin is not allowed.']);
}

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    jsonResponse(415, ['error' => 'Send the request as JSON.']);
}

try {
    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $error) {
    jsonResponse(400, ['error' => 'Request body must be valid JSON.']);
}

if (!is_array($input) || !isset($input['username'], $input['password']) ||
    !is_string($input['username']) || !is_string($input['password'])) {
    jsonResponse(400, ['error' => 'Administrator username and password are required.']);
}

$localConfigPath = __DIR__ . '/config.local.php';
$localConfig = is_file($localConfigPath) ? require $localConfigPath : [];
$adminUsername = getenv('NOVA_ADMIN_USERNAME');
if ($adminUsername === false) {
    $adminUsername = is_array($localConfig) ? (string) ($localConfig['admin_username'] ?? '') : '';
}
$passwordHash = getenv('NOVA_ADMIN_PASSWORD_HASH');
if ($passwordHash === false) {
    $passwordHash = is_array($localConfig) ? (string) ($localConfig['admin_password_hash'] ?? '') : '';
}

if ($adminUsername === '' || $passwordHash === '') {
    jsonResponse(503, ['error' => 'Administrator login has not been configured on the server.']);
}

if (!hash_equals($adminUsername, $input['username']) || !password_verify($input['password'], $passwordHash)) {
    jsonResponse(401, ['error' => 'Invalid administrator credentials.']);
}

startApiSession();
session_regenerate_id(true);
$_SESSION['admin_authenticated'] = true;
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

jsonResponse(200, [
    'authenticated' => true,
    'csrfToken' => $_SESSION['csrf_token'],
]);
