<?php
declare(strict_types=1);

require_once __DIR__ . '/http.php';
require_once __DIR__ . '/database.php';

requireMethod('GET');

try {
    databaseConnection()->query('SELECT 1');
    jsonResponse(200, ['status' => 'ok', 'database' => 'connected']);
} catch (Throwable $error) {
    error_log('Database health check failed: ' . $error->getMessage());
    jsonResponse(503, ['status' => 'error', 'error' => 'Database is unavailable.']);
}
