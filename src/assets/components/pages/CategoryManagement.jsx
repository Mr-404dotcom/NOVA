import { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTag, FiTrash2, FiX } from "react-icons/fi";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../../api.js";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      setCategories(result.data);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let current = true;
    getCategories().then((result) => {
      if (current) setCategories(result.data);
    }).catch((requestError) => {
      if (current) setError(requestError.message || "Could not load categories.");
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, []);

  function openForm(category = null) {
    setEditing(category);
    setName(category?.name || "");
    setDescription(category?.description || "");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setName("");
    setDescription("");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = { name: name.trim(), description: description.trim() || null };
      if (editing) await updateCategory(editing.id, data);
      else await createCategory(data);
      closeForm();
      setLoading(true);
      await loadCategories();
    } catch (requestError) {
      setError(requestError.message || "Could not save this category.");
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(category) {
    if (!window.confirm(`Delete “${category.name}”? Categories assigned to products cannot be deleted.`)) return;
    setError("");
    try {
      await deleteCategory(category.id);
      setLoading(true);
      await loadCategories();
    } catch (requestError) {
      setError(requestError.message || "Could not delete this category.");
    }
  }

  return (
    <section className="catalog-page">
      <div className="category-toolbar">
        <p>{categories.length} {categories.length === 1 ? "category" : "categories"}</p>
        <button className="catalog-button primary" type="button" onClick={() => openForm()}><FiPlus /> Add category</button>
      </div>

      {formOpen && <form className="catalog-form category-form" onSubmit={submit}>
        <div className="catalog-form-heading">
          <div><h3>{editing ? "Edit category" : "Add a category"}</h3><p>Names must be unique.</p></div>
          <button className="catalog-icon-button" type="button" aria-label="Close form" onClick={closeForm}><FiX /></button>
        </div>
        <div className="catalog-form-grid">
          <label>Category name<input value={name} onChange={(event) => setName(event.target.value)} maxLength="120" required /></label>
          <label>Description<input value={description} onChange={(event) => setDescription(event.target.value)} maxLength="500" /></label>
        </div>
        <div className="catalog-form-actions">
          <button className="catalog-button secondary" type="button" onClick={closeForm} disabled={saving}>Cancel</button>
          <button className="catalog-button primary" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create category"}</button>
        </div>
      </form>}

      {error && <p className="catalog-page-error" role="alert">{error}</p>}
      <div className="category-list">
        {loading ? <p className="catalog-message">Loading categories…</p> : categories.length === 0 ? (
          <div className="catalog-message"><FiTag /><strong>No categories yet</strong><span>Create a category to organize products.</span></div>
        ) : categories.map((category) => (
          <article className="category-card" key={category.id}>
            <span className="category-card-icon"><FiTag /></span>
            <div><h3>{category.name}</h3><p>{category.description || "No description"}</p></div>
            <div className="catalog-row-actions">
              <button className="catalog-icon-button" type="button" aria-label={`Edit ${category.name}`} onClick={() => openForm(category)}><FiEdit2 /></button>
              <button className="catalog-icon-button danger" type="button" aria-label={`Delete ${category.name}`} onClick={() => removeCategory(category)}><FiTrash2 /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
