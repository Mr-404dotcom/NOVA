<?php
declare(strict_types=1);

require_once __DIR__ . '/http.php';
require_once __DIR__ . '/database.php';

requireMethod('GET');
requireAdmin();

try {
    $pdo = databaseConnection();
    $productCount = (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();

    jsonResponse(200, [
        'data' => [
            'total_products' => $productCount,
            'total_orders' => null,
            'total_customers' => null,
            'total_revenue' => null,
            'sales_trend' => [],
            'recent_orders' => [],
        ],
        'unavailable' => ['orders', 'customers', 'revenue', 'sales_trend', 'recent_orders'],
    ]);
} catch (Throwable $error) {
    error_log('Dashboard API failure: ' . $error->getMessage());
    jsonResponse(503, ['error' => 'Dashboard data is temporarily unavailable.']);
}
