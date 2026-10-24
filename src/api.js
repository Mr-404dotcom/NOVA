const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

let csrfToken = "";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, csrf = true } = {}) {
  const headers = { Accept: "application/json" };
  const changesState = !["GET", "HEAD", "OPTIONS"].includes(method);

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (changesState && csrf && csrfToken) headers["X-CSRF-Token"] = csrfToken;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/${path}`, {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the PHP API. Check that it is running and try again.");
  }

  const responseText = await response.text();
  let result;
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new ApiError("The API returned an invalid response. Check the PHP server log.", response.status);
  }

  if (!response.ok) {
    if (response.status === 401) csrfToken = "";
    throw new ApiError(result.error || "The request failed.", response.status);
  }
  return result;
}

export async function getLoginStatus() {
  const result = await request("login.php");
  csrfToken = result.csrfToken || "";
  return result;
}

export async function login(username, password) {
  const result = await request("login.php", { method: "POST", body: { username, password }, csrf: false });
  csrfToken = result.csrfToken || "";
  return result;
}

export async function logout() {
  const result = await request("logout.php", { method: "POST" });
  csrfToken = "";
  return result;
}

export function getProducts(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.set("q", filters.search);
  if (filters.status) query.set("status", filters.status);
  if (filters.categoryId) query.set("category_id", filters.categoryId);
  if (filters.page) query.set("page", String(filters.page));
  if (filters.perPage) query.set("per_page", String(filters.perPage));
  const suffix = query.size ? `?${query}` : "";
  return request(`products.php${suffix}`);
}

export function getDashboardStats() {
  return request("dashboard.php");
}

export function createProduct(product) {
  return request("products.php", { method: "POST", body: product });
}

export function updateProduct(id, product) {
  return request(`products.php?id=${encodeURIComponent(id)}`, { method: "PUT", body: product });
}

export function deleteProduct(id) {
  return request(`products.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getCategories() {
  return request("categories.php");
}

export function createCategory(category) {
  return request("categories.php", { method: "POST", body: category });
}

export function updateCategory(id, category) {
  return request(`categories.php?id=${encodeURIComponent(id)}`, { method: "PUT", body: category });
}

export function deleteCategory(id) {
  return request(`categories.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}
