<?php
// Copy this file to config.local.php and set your local MySQL credentials.
// config.local.php is excluded from version control.
return [
    'host' => '127.0.0.1',
    'port' => '3306',
    'name' => 'nova_app',
    'user' => 'root',
    'password' => '', // Fresh XAMPP installations commonly use an empty password.
    'admin_username' => 'admin',
    'admin_password_hash' => '', // Required for dashboard login; never store a plaintext password.
];
