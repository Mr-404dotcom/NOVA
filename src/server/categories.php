<?php
declare(strict_types=1);

require_once __DIR__ . '/http.php';
require_once __DIR__ . '/database.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') {
    exit;
}
if (!in_array($method, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    header('Allow: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    jsonResponse(405, ['error' => 'Method not allowed.']);
}

requireAdmin();
if ($method !== 'GET') {
    requireCsrfProtection();
}

function validateCategory(array $input): array
{
    $rawName = $input['name'] ?? null;
    if (!is_string($rawName)) {
        jsonResponse(422, ['error' => 'Category name is required.']);
    }
    $name = trim($rawName);
    $description = $input['description'] ?? null;

    if ($name === '' || (function_exists('mb_strlen') ? mb_strlen($name) : strlen($name)) > 120) {
        jsonResponse(422, ['error' => 'Category name is required and must be 120 characters or fewer.']);
    }
    if ($description !== null && !is_string($description)) {
        jsonResponse(422, ['error' => 'Category description must be text.']);
    }
    $description = $description === null ? null : trim($description);
    if ($description !== null && (function_exists('mb_strlen') ? mb_strlen($description) : strlen($description)) > 500) {
        jsonResponse(422, ['error' => 'Category description must be 500 characters or fewer.']);
    }

    return ['name' => $name, 'description' => $description === '' ? null : $description];
}

try {
    $pdo = databaseConnection();

    if ($method === 'GET') {
        $statement = $pdo->query('SELECT id, name, description, created_at, updated_at FROM categories ORDER BY name');
        jsonResponse(200, ['data' => $statement->fetchAll()]);
    }

    if ($method === 'POST') {
        $category = validateCategory(requestJsonBody());
        $statement = $pdo->prepare('INSERT INTO categories (name, description) VALUES (:name, :description)');
        $statement->execute($category);
        $category['id'] = (int) $pdo->lastInsertId();
        jsonResponse(201, ['data' => $category]);
    }

    $id = positiveQueryId();
    $find = $pdo->prepare('SELECT id, name, description FROM categories WHERE id = :id');
    $find->execute(['id' => $id]);
    $existing = $find->fetch();
    if (!$existing) {
        jsonResponse(404, ['error' => 'Category not found.']);
    }

    if ($method === 'DELETE') {
        $delete = $pdo->prepare('DELETE FROM categories WHERE id = :id');
        $delete->execute(['id' => $id]);
        jsonResponse(200, ['deleted' => true, 'id' => $id]);
    }

    $input = requestJsonBody();
    $category = validateCategory([
        'name' => array_key_exists('name', $input) ? $input['name'] : $existing['name'],
        'description' => array_key_exists('description', $input) ? $input['description'] : $existing['description'],
    ]);
    $update = $pdo->prepare('UPDATE categories SET name = :name, description = :description WHERE id = :id');
    $update->execute($category + ['id' => $id]);
    jsonResponse(200, ['data' => ['id' => $id] + $category]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        jsonResponse(409, ['error' => 'Category name already exists or the category is still assigned to products.']);
    }
    error_log('Category API failure: ' . $error->getMessage());
    jsonResponse(503, ['error' => 'Category service is temporarily unavailable.']);
} catch (Throwable $error) {
    error_log('Category API failure: ' . $error->getMessage());
    jsonResponse(503, ['error' => 'Category service is temporarily unavailable.']);
}
