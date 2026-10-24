<?php
declare(strict_types=1);

require_once __DIR__ . '/http.php';
require_once __DIR__ . '/database.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    header('Allow: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    jsonResponse(405, ['error' => 'Method not allowed.']);
}

requireAdmin();
if ($method !== 'GET') {
    requireCsrfProtection();
}

function validateProduct(array $input): array
{
    $rawName = $input['name'] ?? null;
    if (!is_string($rawName)) {
        jsonResponse(422, ['error' => 'Product name is required.']);
    }
    $name = trim($rawName);
    if ($name === '' || (function_exists('mb_strlen') ? mb_strlen($name) : strlen($name)) > 180) {
        jsonResponse(422, ['error' => 'Product name is required and must be 180 characters or fewer.']);
    }

    $description = $input['description'] ?? null;
    if ($description !== null && !is_string($description)) {
        jsonResponse(422, ['error' => 'Product description must be text.']);
    }
    $description = $description === null ? null : trim($description);
    if ($description !== null && strlen($description) > 65535) {
        jsonResponse(422, ['error' => 'Product description is too long.']);
    }

    $price = $input['price'] ?? null;
    if ((!is_string($price) && !is_int($price) && !is_float($price)) ||
        !preg_match('/^(?:0|[1-9][0-9]{0,7})(?:\.[0-9]{1,2})?$/', (string) $price)) {
        jsonResponse(422, ['error' => 'Price must be a non-negative amount with up to 8 whole-number digits and 2 decimals.']);
    }

    $stock = $input['stock_quantity'] ?? 0;
    if ((!is_string($stock) && !is_int($stock)) || !preg_match('/^(0|[1-9][0-9]*)$/', (string) $stock) || (float) $stock > 4294967295) {
        jsonResponse(422, ['error' => 'Stock quantity must be a non-negative whole number.']);
    }

    $categoryId = $input['category_id'] ?? null;
    if ($categoryId === '') {
        $categoryId = null;
    }
    if ($categoryId !== null && ((!is_string($categoryId) && !is_int($categoryId)) ||
        !preg_match('/^[1-9][0-9]*$/', (string) $categoryId) || (float) $categoryId > PHP_INT_MAX)) {
        jsonResponse(422, ['error' => 'Choose a valid category.']);
    }

    $imageUrl = $input['image_url'] ?? null;
    if ($imageUrl !== null && !is_string($imageUrl)) {
        jsonResponse(422, ['error' => 'Product image must be a URL.']);
    }
    $imageUrl = $imageUrl === null ? null : trim($imageUrl);
    if ($imageUrl !== null && $imageUrl !== '') {
        $scheme = strtolower((string) parse_url($imageUrl, PHP_URL_SCHEME));
        if (strlen($imageUrl) > 2048 || filter_var($imageUrl, FILTER_VALIDATE_URL) === false || !in_array($scheme, ['http', 'https'], true)) {
            jsonResponse(422, ['error' => 'Product image must be a valid HTTP or HTTPS URL.']);
        }
    } else {
        $imageUrl = null;
    }

    $status = $input['status'] ?? 'draft';
    if (!is_string($status) || !in_array($status, ['draft', 'active', 'archived'], true)) {
        jsonResponse(422, ['error' => 'Product status must be draft, active, or archived.']);
    }

    return [
        'name' => $name,
        'description' => $description === '' ? null : $description,
        'price' => number_format((float) $price, 2, '.', ''),
        'category_id' => $categoryId === null ? null : (int) $categoryId,
        'stock_quantity' => (int) $stock,
        'image_url' => $imageUrl,
        'status' => $status,
    ];
}

function fetchProduct(PDO $pdo, int $id): array|false
{
    $statement = $pdo->prepare(
        'SELECT p.id, p.name, p.description, p.price, p.category_id, c.name AS category_name,
                p.stock_quantity, p.image_url, p.status, p.created_at, p.updated_at
         FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = :id'
    );
    $statement->execute(['id' => $id]);
    return $statement->fetch();
}

try {
    $pdo = databaseConnection();

    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $product = fetchProduct($pdo, positiveQueryId());
            if (!$product) {
                jsonResponse(404, ['error' => 'Product not found.']);
            }
            jsonResponse(200, ['data' => $product]);
        }

        $filters = [];
        $parameters = [];
        $searchValue = $_GET['q'] ?? '';
        if (!is_string($searchValue)) {
            jsonResponse(400, ['error' => 'Search text must be a string.']);
        }
        $search = trim($searchValue);
        if ($search !== '') {
            if (strlen($search) > 200) {
                jsonResponse(400, ['error' => 'Search text is too long.']);
            }
            $filters[] = '(p.name LIKE :search_name OR p.description LIKE :search_description)';
            $parameters['search_name'] = '%' . $search . '%';
            $parameters['search_description'] = '%' . $search . '%';
        }

        if (isset($_GET['status']) && $_GET['status'] !== '') {
            if (!is_string($_GET['status'])) {
                jsonResponse(400, ['error' => 'Invalid product status filter.']);
            }
            $status = $_GET['status'];
            if (!in_array($status, ['draft', 'active', 'archived'], true)) {
                jsonResponse(400, ['error' => 'Invalid product status filter.']);
            }
            $filters[] = 'p.status = :status';
            $parameters['status'] = $status;
        }

        if (isset($_GET['category_id']) && $_GET['category_id'] !== '') {
            if (!is_string($_GET['category_id']) || !preg_match('/^[1-9][0-9]*$/', $_GET['category_id'])) {
                jsonResponse(400, ['error' => 'Invalid category filter.']);
            }
            $filters[] = 'p.category_id = :category_id';
            $parameters['category_id'] = (int) $_GET['category_id'];
        }

        $page = filter_var($_GET['page'] ?? '1', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $perPage = filter_var($_GET['per_page'] ?? '20', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 100]]);
        if ($page === false || $perPage === false) {
            jsonResponse(400, ['error' => 'Page must be positive and per_page must be between 1 and 100.']);
        }

        $where = $filters ? ' WHERE ' . implode(' AND ', $filters) : '';
        $count = $pdo->prepare('SELECT COUNT(*) FROM products p' . $where);
        $count->execute($parameters);
        $total = (int) $count->fetchColumn();

        $list = $pdo->prepare(
            'SELECT p.id, p.name, p.description, p.price, p.category_id, c.name AS category_name,
                    p.stock_quantity, p.image_url, p.status, p.created_at, p.updated_at
             FROM products p LEFT JOIN categories c ON c.id = p.category_id' . $where .
            ' ORDER BY p.created_at DESC, p.id DESC LIMIT :limit OFFSET :offset'
        );
        foreach ($parameters as $key => $value) {
            $list->bindValue(':' . $key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $list->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $list->bindValue(':offset', ($page - 1) * $perPage, PDO::PARAM_INT);
        $list->execute();

        jsonResponse(200, [
            'data' => $list->fetchAll(),
            'pagination' => ['page' => $page, 'per_page' => $perPage, 'total' => $total],
        ]);
    }

    if ($method === 'POST') {
        $product = validateProduct(requestJsonBody());
        $insert = $pdo->prepare(
            'INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, status)
             VALUES (:name, :description, :price, :category_id, :stock_quantity, :image_url, :status)'
        );
        $insert->execute($product);
        jsonResponse(201, ['data' => fetchProduct($pdo, (int) $pdo->lastInsertId())]);
    }

    $id = positiveQueryId();
    $existing = fetchProduct($pdo, $id);
    if (!$existing) {
        jsonResponse(404, ['error' => 'Product not found.']);
    }

    if ($method === 'DELETE') {
        $delete = $pdo->prepare('DELETE FROM products WHERE id = :id');
        $delete->execute(['id' => $id]);
        jsonResponse(200, ['deleted' => true, 'id' => $id]);
    }

    $input = requestJsonBody();
    $product = validateProduct([
        'name' => $input['name'] ?? $existing['name'],
        'description' => array_key_exists('description', $input) ? $input['description'] : $existing['description'],
        'price' => $input['price'] ?? $existing['price'],
        'category_id' => array_key_exists('category_id', $input) ? $input['category_id'] : $existing['category_id'],
        'stock_quantity' => $input['stock_quantity'] ?? $existing['stock_quantity'],
        'image_url' => array_key_exists('image_url', $input) ? $input['image_url'] : $existing['image_url'],
        'status' => $input['status'] ?? $existing['status'],
    ]);
    $product['id'] = $id;
    $update = $pdo->prepare(
        'UPDATE products SET name = :name, description = :description, price = :price,
             category_id = :category_id, stock_quantity = :stock_quantity,
             image_url = :image_url, status = :status WHERE id = :id'
    );
    $update->execute($product);
    jsonResponse(200, ['data' => fetchProduct($pdo, $id)]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        jsonResponse(409, ['error' => 'The selected category does not exist or the product conflicts with related data.']);
    }
    error_log('Product API failure: ' . $error->getMessage());
    jsonResponse(503, ['error' => 'Product service is temporarily unavailable.']);
} catch (Throwable $error) {
    error_log('Product API failure: ' . $error->getMessage());
    jsonResponse(503, ['error' => 'Product service is temporarily unavailable.']);
}
