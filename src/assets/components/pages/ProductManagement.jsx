import { useEffect, useState } from "react";
import { FiBox, FiChevronLeft, FiChevronRight, FiEdit2, FiImage, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { createProduct, deleteProduct, getCategories, getProducts, updateProduct } from "../../../api.js";

const blankProduct = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  stock_quantity: "0",
  image_url: "",
  status: "draft",
};

function ProductForm({ product, categories, onCancel, onSaved }) {
  const [form, setForm] = useState(product ? {
    name: product.name,
    description: product.description || "",
    price: product.price,
    category_id: product.category_id ? String(product.category_id) : "",
    stock_quantity: String(product.stock_quantity),
    image_url: product.image_url || "",
    status: product.status,
  } : blankProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      ...form,
      category_id: form.category_id || null,
      image_url: form.image_url.trim() || null,
      stock_quantity: Number(form.stock_quantity),
    };

    try {
      if (product) await updateProduct(product.id, data);
      else await createProduct(data);
      onSaved();
    } catch (requestError) {
      setError(requestError.message || "Could not save this product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="catalog-form" onSubmit={submit}>
      <div className="catalog-form-heading">
        <div><h3>{product ? "Edit product" : "Add a product"}</h3><p>Product images are added using a public image URL.</p></div>
        <button className="catalog-icon-button" type="button" aria-label="Close form" onClick={onCancel}><FiX /></button>
      </div>
      <div className="catalog-form-grid">
        <label>Product name<input name="name" value={form.name} onChange={updateField} maxLength="180" required /></label>
        <label>Price<input name="price" type="number" min="0" max="99999999.99" step="0.01" value={form.price} onChange={updateField} required /></label>
        <label>Category
          <select name="category_id" value={form.category_id} onChange={updateField}>
            <option value="">Uncategorized</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>Stock quantity<input name="stock_quantity" type="number" min="0" step="1" value={form.stock_quantity} onChange={updateField} required /></label>
        <label>Status
          <select name="status" value={form.status} onChange={updateField}>
            <option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option>
          </select>
        </label>
        <label>Image URL<input name="image_url" type="url" value={form.image_url} onChange={updateField} placeholder="https://example.com/image.jpg" /></label>
        <label className="catalog-form-wide">Description<textarea name="description" value={form.description} onChange={updateField} rows="3" /></label>
      </div>
      {error && <p className="catalog-form-error" role="alert">{error}</p>}
      <div className="catalog-form-actions">
        <button className="catalog-button secondary" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="catalog-button primary" type="submit" disabled={saving}>{saving ? "Saving…" : product ? "Save changes" : "Create product"}</button>
      </div>
    </form>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0 });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let current = true;
    Promise.all([
      getProducts({ search, status, categoryId, page, perPage: 20 }),
      getCategories(),
    ]).then(([productResult, categoryResult]) => {
      if (!current) return;
      setProducts(productResult.data);
      setPagination(productResult.pagination);
      setCategories(categoryResult.data);
    }).catch((requestError) => {
      if (current) setError(requestError.message || "Could not load products.");
    }).finally(() => {
      if (current) setLoading(false);
    });

    return () => { current = false; };
  }, [search, status, categoryId, page, refreshKey]);

  function startCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function startEdit(product) {
    setEditing(product);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteProduct(product.id);
      setLoading(true);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(requestError.message || "Could not delete this product.");
    }
  }

  function applySearch(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPage(1);
    setSearch(searchText.trim());
  }

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.per_page));

  return (
    <section className="catalog-page">
      <div className="catalog-toolbar">
      <form className="catalog-search" onSubmit={applySearch}>
          <FiSearch aria-hidden="true" />
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search products" aria-label="Search products" />
          <button type="submit">Search</button>
        </form>
        <div className="catalog-filters">
          <select aria-label="Filter by status" value={status} onChange={(event) => { setLoading(true); setError(""); setStatus(event.target.value); setPage(1); }}>
            <option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
          </select>
          <select aria-label="Filter by category" value={categoryId} onChange={(event) => { setLoading(true); setError(""); setCategoryId(event.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <button className="catalog-button primary" type="button" onClick={startCreate}><FiPlus /> Add product</button>
      </div>

      {showForm && <ProductForm product={editing} categories={categories} onCancel={closeForm} onSaved={() => { closeForm(); setLoading(true); setRefreshKey((key) => key + 1); }} />}
      {error && <p className="catalog-page-error" role="alert">{error}</p>}

      <div className="catalog-table-wrap">
        {loading ? <p className="catalog-message">Loading products…</p> : products.length === 0 ? (
          <div className="catalog-message"><FiBox /><strong>{search || status || categoryId ? "No matching products" : "No products yet"}</strong><span>{search || status || categoryId ? "Try changing your search or filters." : "Add your first product to begin managing the catalog."}</span></div>
        ) : (
          <table className="catalog-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><div className="catalog-product-cell">
                    {product.image_url ? <img src={product.image_url} alt="" loading="lazy" /> : <span className="catalog-product-image"><FiImage /></span>}
                    <span><strong>{product.name}</strong><small>{product.description || "No description"}</small></span>
                  </div></td>
                  <td>{product.category_name || "Uncategorized"}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.stock_quantity}</td>
                  <td><span className={`catalog-status ${product.status}`}>{product.status}</span></td>
                  <td><div className="catalog-row-actions">
                    <button className="catalog-icon-button" type="button" aria-label={`Edit ${product.name}`} onClick={() => startEdit(product)}><FiEdit2 /></button>
                    <button className="catalog-icon-button danger" type="button" aria-label={`Delete ${product.name}`} onClick={() => removeProduct(product)}><FiTrash2 /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && pagination.total > 0 && <div className="catalog-pagination">
        <span>Showing {(page - 1) * pagination.per_page + 1}–{Math.min(page * pagination.per_page, pagination.total)} of {pagination.total} products</span>
        <div>
          <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => Math.max(1, value - 1)); }}><FiChevronLeft /></button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => Math.min(totalPages, value + 1)); }}><FiChevronRight /></button>
        </div>
      </div>}
    </section>
  );
}
