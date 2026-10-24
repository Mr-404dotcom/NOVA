<?php
declare(strict_types=1);

/** Return the shared PDO connection to the project's MySQL database. */
function databaseConnection(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $localConfigPath = __DIR__ . '/config.local.php';
    $localConfig = is_file($localConfigPath) ? require $localConfigPath : [];
    if (!is_array($localConfig)) {
        $localConfig = [];
    }

    $setting = static function (string $environmentName, string $key, string $default) use ($localConfig): string {
        $environmentValue = getenv($environmentName);
        if ($environmentValue !== false) {
            return $environmentValue;
        }
        return (string) ($localConfig[$key] ?? $default);
    };

    // Non-secret connection details have local XAMPP defaults; credentials must
    // come from the environment or the ignored config.local.php file.
    $host = $setting('DB_HOST', 'host', '127.0.0.1');
    $port = $setting('DB_PORT', 'port', '3306');
    $name = $setting('DB_NAME', 'name', 'nova_app');
    $username = $setting('DB_USER', 'user', '');
    $password = $setting('DB_PASSWORD', 'password', '');

    if ($username === '') {
        throw new RuntimeException('Database credentials are not configured.');
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
