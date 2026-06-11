import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const EMPTY_FORM = { name: '', slug: '', parent_id: '', is_active: true };

function showToast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = 'admin-toast';
  if (type === 'error') el.style.borderColor = 'rgba(239,68,68,0.4)';
  el.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadCategories = useCallback(() => {
    api.get('/api/categories')
      .then((res) => setCategories(res.data.data || []))
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.parent_id !== b.parent_id) return (a.parent_id || 0) - (b.parent_id || 0);
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  const filtered = sortedCategories.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const topLevel = categories.filter((c) => !c.parent_id).length;
  const subLevel  = categories.filter((c) =>  c.parent_id).length;

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
    const payload = { ...form, parent_id: form.parent_id || null };
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
      showToast(err.response?.data?.error || 'Save failed', 'error');
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
      showToast('Delete failed', 'error');
    }
  };

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      Loading categories…
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-subtitle">
            {topLevel} top-level · {subLevel} subcategories
          </p>
        </div>
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="admin-search-input"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Parent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className={c.parent_id ? 'admin-cat-indent' : ''}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: 8,
                      background: c.parent_id ? 'rgba(59,130,246,0.12)' : 'rgba(212,168,90,0.12)',
                      color: c.parent_id ? 'var(--ainfo)' : 'var(--ap)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {c.parent_id ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h6l2 3h10a2 2 0 012 2v11a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
                      )}
                    </div>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                  </div>
                </td>
                <td>
                  <code style={{ fontSize: '0.78rem', color: 'var(--amuted)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4 }}>
                    {c.slug}
                  </code>
                </td>
                <td style={{ color: 'var(--amuted)', fontSize: '0.875rem' }}>
                  {c.parent_name || <span style={{ opacity: 0.4 }}>—</span>}
                </td>
                <td>
                  <span className={`admin-badge ${c.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn-sm" onClick={() => openEdit(c)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(c.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <div className="admin-empty-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                      </svg>
                    </div>
                    {search ? 'No categories match your search' : 'No categories yet'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="admin-modal-title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                  </svg>
                </div>
                <h2>{editing ? 'Edit Category' : 'New Category'}</h2>
              </div>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleSave} className="admin-form">

                <div className="admin-field">
                  <label className="admin-field-label">Category Name <span className="req">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: editing ? f.slug : slugify(e.target.value),
                    }))}
                    placeholder="e.g. Pillows"
                    required
                    autoFocus
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-field-label">URL Slug <span className="req">*</span></label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="pillows"
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-field-label">Parent Category</label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                  >
                    <option value="">— Top Level —</option>
                    {categories
                      .filter((c) => !editing || c.id !== editing.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                  <p style={{ fontSize: '0.75rem', color: 'var(--amuted)', marginTop: '0.35rem' }}>
                    Leave empty to make this a top-level category
                  </p>
                </div>

                <div className="admin-form-checks">
                  <label className="admin-check-label">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    />
                    ✓ Active (visible in store)
                  </label>
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        Saving…
                      </>
                    ) : (
                      editing ? 'Save Changes' : 'Create Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
