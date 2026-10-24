<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Vary: Origin');

$allowedOrigin = getenv('CORS_ALLOWED_ORIGIN') ?: 'http://localhost:5173';
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($requestOrigin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function startApiSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $defaultSessionPath = session_save_path();
    if ($defaultSessionPath === '' || !is_dir($defaultSessionPath) || !is_writable($defaultSessionPath)) {
        $privateSessionPath = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR)
            . DIRECTORY_SEPARATOR . 'nova-store-sessions';
        if (!is_dir($privateSessionPath) && !mkdir($privateSessionPath, 0700, true) && !is_dir($privateSessionPath)) {
            throw new RuntimeException('Could not initialize the private session directory.');
        }
        session_save_path($privateSessionPath);
    }

    $isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('nova_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function jsonResponse(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function requireMethod(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method . ', OPTIONS');
        jsonResponse(405, ['error' => 'Method not allowed.']);
    }
}

function requireAdmin(): void
{
    startApiSession();
    if (empty($_SESSION['admin_authenticated'])) {
        jsonResponse(401, ['error' => 'Administrator login required.']);
    }
}

function requireCsrfProtection(): void
{
    requireAdmin();

    global $allowedOrigin, $requestOrigin;
    if ($requestOrigin !== $allowedOrigin) {
        jsonResponse(403, ['error' => 'Request origin is not allowed.']);
    }

    $sessionToken = $_SESSION['csrf_token'] ?? '';
    $requestToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sessionToken) || $sessionToken === '' || !hash_equals($sessionToken, $requestToken)) {
        jsonResponse(403, ['error' => 'Invalid security token. Refresh your session and try again.']);
    }
}

function csrfToken(): string
{
    startApiSession();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function requestJsonBody(): array
{
    $contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($contentType !== 'application/json') {
        jsonResponse(415, ['error' => 'Send the request as JSON.']);
    }

    try {
        $body = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        jsonResponse(400, ['error' => 'Request body must be valid JSON.']);
    }

    if (!is_array($body)) {
        jsonResponse(400, ['error' => 'Request body must be a JSON object.']);
    }
    return $body;
}

function positiveQueryId(): int
{
    $id = $_GET['id'] ?? null;
    if (!is_string($id) || !preg_match('/^[1-9][0-9]*$/', $id) || (float) $id > PHP_INT_MAX) {
        jsonResponse(400, ['error' => 'A valid positive record ID is required.']);
    }
    return (int) $id;
}
