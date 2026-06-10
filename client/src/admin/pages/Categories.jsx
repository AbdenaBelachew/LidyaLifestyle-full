import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const EMPTY_FORM = { name: '', slug: '', parent_id: '', is_active: true };

function showToast(message) {
  const el = document.createElement('div');
  el.className = 'admin-toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(() => {
    api.get('/api/categories')
      .then((res) => setCategories(res.data.data || []))
      .catch(() => showToast('Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.parent_id !== b.parent_id) return (a.parent_id || 0) - (b.parent_id || 0);
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id || '',
      is_active: cat.is_active !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      parent_id: form.parent_id || null,
    };
    try {
      if (editing) {
        await api.put(`/api/categories/${editing.id}`, payload);
        showToast('Category updated');
      } else {
        await api.post('/api/categories', payload);
        showToast('Category created');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this category?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      showToast('Category deactivated');
      loadCategories();
    } catch {
      showToast('Delete failed');
    }
  };

  if (loading) return <div className="admin-loading">Loading categories…</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Categories</h1>
        <button type="button" className="admin-btn-primary" onClick={openCreate}>Add Category</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Parent</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((c) => (
              <tr key={c.id}>
                <td style={{ paddingLeft: c.parent_id ? '2rem' : '0.75rem' }}>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.parent_name || '—'}</td>
                <td>{c.is_active ? 'Yes' : 'No'}</td>
                <td className="admin-actions">
                  <button type="button" className="admin-btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button type="button" className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="admin-modal-close" onClick={() => setModalOpen(false)}>×</button>
            <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: editing ? f.slug : slugify(e.target.value),
                  }))}
                  required
                />
              </label>
              <label>Slug<input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required /></label>
              <label>
                Parent Category
                <select value={form.parent_id} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}>
                  <option value="">Top Level</option>
                  {categories.filter((c) => !editing || c.id !== editing.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active</label>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
