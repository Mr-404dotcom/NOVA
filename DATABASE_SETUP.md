# Local MySQL and PHP API setup

## Current data model

The project stores newsletter signups plus the product catalog used by the dashboard. `categories` has unique names. `products` stores names, descriptions, decimal prices, stock quantities, optional HTTP(S) image URLs, and draft/active/archived status. A product may reference a category; MySQL prevents deleting a category while products use it. The project has no order, customer, or cart tables, so those dashboard panels remain empty rather than showing invented data.

## 1. Create the database in XAMPP

1. Open the XAMPP Control Panel and start **MySQL**. Start **Apache** too if you want to use phpMyAdmin from `http://localhost/phpmyadmin`.
2. In phpMyAdmin, choose **Import**, select the project's `database.sql`, and click **Import**. It creates the database and missing tables (`newsletter_subscribers`, `categories`, and `products`) without dropping tables or rows.
3. Confirm those three tables appear under `nova_app`.

## 2. Configure local database credentials

The PHP API reads `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` from the environment, or from `src/server/config.local.php`. This checkout has an ignored local config set to the fresh XAMPP defaults (`127.0.0.1:3306`, database `nova_app`, user `root`, empty password). If you need to recreate it, copy `src/server/config.example.php` to `src/server/config.local.php` and edit the values. `config.local.php` is excluded from Git. Never put these credentials in React or a `VITE_` variable.

## 3. Configure the admin password

The dashboard write endpoints require an admin session. This local checkout is configured with username `admin` and password `admin123`; the password is stored as a hash in the Git-ignored `src/server/config.local.php`. This weak password is for local development only.

To replace it, generate a password hash in PowerShell (the password is entered locally and only its hash is stored):

```powershell
& 'C:\xampp\php\php.exe' -r "echo password_hash(readline('New admin password: '), PASSWORD_DEFAULT), PHP_EOL;"
```

Copy the printed hash into the ignored `src/server/config.local.php` file, keeping or changing the `admin_username` value as desired:

```php
'admin_username' => 'admin',
'admin_password_hash' => 'PASTE_THE_GENERATED_HASH_HERE',
```

Do not use the placeholder text literally. The browser login checks the username and this hash with `password_verify`; there is no public signup route.

## 4. Run the API and React app

This project is currently under Desktop, outside XAMPP's `htdocs`. Run the API with XAMPP's PHP CLI from a PowerShell window opened at the project root:

```powershell
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8000 -t src/server
```

Keep that window open. In another PowerShell window at the project root, run:

```powershell
npm.cmd run dev -- --host localhost --strictPort
```

Open the Vite URL, normally `http://localhost:5173`. The API allows that development origin by default. If Vite uses another origin, set `CORS_ALLOWED_ORIGIN` for the PHP server to the exact origin (scheme, host, and port). The optional frontend variable `VITE_API_BASE_URL` changes the API URL; by default it is `http://localhost:8000`. To change it, copy `.env.example` to `.env.local`, edit the URL, then restart Vite. `.env.local` is ignored by Git. Never put server credentials in a `VITE_` variable.

## 5. Endpoints

- `GET http://127.0.0.1:8000/health.php` checks the PDO connection and returns `{"status":"ok","database":"connected"}`. A failed connection returns HTTP 503 and a generic error; technical details go to the PHP error log.
- `POST http://127.0.0.1:8000/newsletter.php` accepts JSON such as `{"email":"person@example.com"}`. A new subscription returns HTTP 201 with `{"message":"Thanks for subscribing."}`. Invalid email returns HTTP 422; an existing email returns HTTP 409; unavailable database returns HTTP 503.
- `GET/POST/PUT/PATCH/DELETE http://127.0.0.1:8000/products.php` provides authenticated product CRUD. Supply `?id=PRODUCT_ID` for a single record or update/delete operation. List queries support `q`, `status`, `category_id`, `page`, and `per_page`.
- `GET/POST/PUT/PATCH/DELETE http://127.0.0.1:8000/categories.php` provides authenticated category CRUD. Deleting a category in use returns HTTP 409.
- `GET http://127.0.0.1:8000/dashboard.php` returns the live product count; order, customer, revenue, and trend values are null until those features have database tables.
- `GET/POST http://127.0.0.1:8000/login.php` starts/checks the admin session. `POST http://127.0.0.1:8000/logout.php` ends it. Product/category writes require the session CSRF token; the React API service handles cookies and token headers.

PowerShell request example:

```powershell
Invoke-RestMethod -Method Post `
  -Uri 'http://127.0.0.1:8000/newsletter.php' `
  -ContentType 'application/json' `
  -Body '{"email":"person@example.com"}'
```

The React footer form submits to the newsletter endpoint. The dashboard **Get Started** flow prompts for the admin password, then provides product/category create, list, edit, delete, search, filtering, and pagination. Product images use URLs; file upload is not configured.

## Notes

The connection uses PDO exceptions, native prepared statements, JSON responses, input validation, fixed-origin credentialed CORS, HTTP-only sessions, and CSRF checks on writes. Database errors are logged server-side and are not returned with credentials or SQL details. If XAMPP's configured session directory is not writable, sessions use a private subdirectory of the operating system's temporary directory, outside the PHP document root. The `/NOVA/` Vite base is for static frontend deployment; PHP must be hosted by a PHP-capable server and cannot run from GitHub Pages/static hosting.
