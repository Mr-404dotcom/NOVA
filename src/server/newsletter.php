<?php
declare(strict_types=1);

require_once __DIR__ . '/http.php';
require_once __DIR__ . '/database.php';

requireMethod('POST');

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    jsonResponse(415, ['error' => 'Send the request as JSON.']);
}

try {
    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $error) {
    jsonResponse(400, ['error' => 'Request body must be valid JSON.']);
}

if (!is_array($input) || !isset($input['email']) || !is_string($input['email'])) {
    jsonResponse(422, ['error' => 'A valid email address is required.']);
}

$email = strtolower(trim($input['email']));
if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    jsonResponse(422, ['error' => 'Enter a valid email address.']);
}

try {
    $statement = databaseConnection()->prepare(
        'INSERT INTO newsletter_subscribers (email) VALUES (:email)'
    );
    $statement->execute(['email' => $email]);
    jsonResponse(201, ['message' => 'Thanks for subscribing.']);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        jsonResponse(409, ['error' => 'This email is already subscribed.']);
    }

    error_log('Newsletter subscription failed: ' . $error->getMessage());
    jsonResponse(503, ['error' => 'Subscription is temporarily unavailable.']);
} catch (Throwable $error) {
    error_log('Newsletter subscription failed: ' . $error->getMessage());
    jsonResponse(503, ['error' => 'Subscription is temporarily unavailable.']);
}
