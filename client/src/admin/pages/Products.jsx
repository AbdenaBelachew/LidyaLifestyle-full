import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const EMPTY_FORM = {
  name: '', slug: '', short_description: '', description: '',
  price: '', category_id: '', stock_qty: '', sku: '',
  is_featured: false, is_active: true,
};

function showToast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = 'admin-toast';
  if (type === 'error') el.style.borderColor = 'rgba(239,68,68,0.4)';
  el.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function ProductRow({ product, onEdit, onDelete }) {
  const initial = product.name?.charAt(0)?.toUpperCase() || '?';
  return (
    <tr>
      <td>
        <div className="admin-product-cell">
          {product.primary_image ? (
            <img className="admin-product-thumb" src={`${API_URL}${product.primary_image}`} alt="" />
          ) : (
            <div className="admin-product-thumb-placeholder">{initial}</div>
          )}
          <div>
            <div className="admin-product-name">{product.name}</div>
            <div className="admin-product-sku">{product.sku || '—'}</div>
          </div>
        </div>
      </td>
      <td style={{ fontWeight: 600 }}>${parseFloat(product.price).toFixed(2)}</td>
      <td>
        <span style={{
          color: product.stock_qty === 0 ? 'var(--aerror)' : product.stock_qty < 5 ? 'var(--awarning)' : 'var(--atext)',
          fontWeight: 600,
        }}>
          {product.stock_qty}
        </span>
      </td>
      <td>
        {product.is_featured
          ? <span className="admin-badge admin-badge-featured">⭐ Featured</span>
          : <span style={{ color: 'var(--amuted)', fontSize: '0.8rem' }}>—</span>}
      </td>
      <td>
        <span className={`admin-badge ${product.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-btn-sm" onClick={() => onEdit(product)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button className="admin-btn-sm admin-btn-danger" onClick={() => onDelete(product.id)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadProducts = useCallback(() => {
    api.get('/api/products', { params: { limit: 200 } })
      .then((res) => setProducts(res.data.data.products || []))
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
    api.get('/api/categories').then((res) => setCategories(res.data.data || []));
  }, [loadProducts]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setModalOpen(true);
  };

  const openEdit = async (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || '',
      description: product.description || '',
      price: product.price,
      category_id: product.category_id || '',
      stock_qty: product.stock_qty,
      sku: product.sku || '',
      is_featured: !!product.is_featured,
      is_active: product.is_active !== false,
    });
    setModalOpen(true);
    try {
      const res = await api.get(`/api/products/${product.id}/images`);
      setImages(res.data.data || []);
    } catch {
      setImages([]);
    }
  };

  const handleNameChange = (name) => {
    setForm((f) => ({ ...f, name, slug: editing ? f.slug : slugify(name) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock_qty: parseInt(form.stock_qty) || 0,
      category_id: form.category_id || null,
    };
    try {
      if (editing) {
        await api.put(`/api/products/${editing.id}`, payload);
        showToast('Product updated successfully');
      } else {
        await api.post('/api/products', payload);
        showToast('Product created successfully');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.error || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    if (!editing || !e.target.files[0]) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    try {
      const res = await api.post(`/api/products/${editing.id}/images`, fd);
      setImages(res.data.data || []);
      showToast('Image uploaded');
    } catch {
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!editing) return;
    try {
      const res = await api.delete(`/api/products/${editing.id}/images/${imageId}`);
      setImages(res.data.data || []);
      showToast('Image removed');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const handleSetPrimary = async (imageId) => {
    if (!editing) return;
    try {
      const res = await api.put(`/api/products/${editing.id}/images/${imageId}/primary`);
      setImages(res.data.data || []);
      showToast('Primary image set');
    } catch {
      showToast('Failed to set primary', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/api/products/${id}`);
      showToast('Product deleted');
      loadProducts();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || String(p.category_id) === String(filterCategory);
    return matchSearch && matchCategory;
  });

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      Loading products…
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} products in your catalog</p>
        </div>
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="admin-search-wrap" style={{ flex: '1 1 min-content' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="admin-search-input"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '0.625rem 1rem',
            borderRadius: '20px',
            border: '1px solid var(--aborder)',
            background: 'transparent',
            color: 'var(--atext)',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ background: 'var(--abg)' }}>All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id} style={{ background: 'var(--abg)' }}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <ProductRow key={p.id} product={p} onEdit={openEdit} onDelete={handleDelete} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty">
                    <div className="admin-empty-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      </svg>
                    </div>
                    {search ? 'No products match your search' : 'No products yet — add your first one!'}
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
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  </svg>
                </div>
                <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>
              </div>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleSave} className="admin-form">

                {/* Basic Info */}
                <div className="admin-form-section-title">Basic Information</div>

                <div className="admin-field">
                  <label className="admin-field-label">Product Name <span className="req">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Afar Throw — Dusk"
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-field-label">URL Slug <span className="req">*</span></label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="afar-throw-dusk"
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-field-label">Short Description</label>
                  <input
                    value={form.short_description}
                    onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
                    placeholder="Brief one-line description"
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-field-label">Full Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Detailed product description…"
                    rows={4}
                  />
                </div>

                <div className="admin-form-divider" />
                <div className="admin-form-section-title">Pricing & Inventory</div>

                <div className="admin-form-row">
                  <div className="admin-field">
                    <label className="admin-field-label">Price (USD) <span className="req">*</span></label>
                    <input
                      type="number" step="0.01" min="0"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">Stock Qty</label>
                    <input
                      type="number" min="0"
                      value={form.stock_qty}
                      onChange={(e) => setForm((f) => ({ ...f, stock_qty: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-field">
                    <label className="admin-field-label">Category</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                    >
                      <option value="">— None —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">SKU</label>
                    <input
                      value={form.sku}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      placeholder="PROD-001"
                    />
                  </div>
                </div>

                <div className="admin-form-checks">
                  <label className="admin-check-label">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                    />
                    ⭐ Featured Product
                  </label>
                  <label className="admin-check-label">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    />
                    ✓ Active (visible in store)
                  </label>
                </div>

                {/* Images — only when editing */}
                {editing && (
                  <>
                    <div className="admin-form-divider" />
                    <div className="admin-form-section-title">Product Images</div>

                    <div className="admin-images-section">
                      {images.length > 0 && (
                        <div className="admin-images-grid">
                          {images.map((img) => (
                            <div key={img.id} className={`admin-image-thumb ${img.is_primary ? 'is-primary' : ''}`}>
                              <img src={`${API_URL}${img.image_path}`} alt="" />
                              {img.is_primary && <span className="admin-primary-badge">Primary</span>}
                              <div className="admin-image-actions">
                                {!img.is_primary && (
                                  <button type="button" onClick={() => handleSetPrimary(img.id)}>★ Main</button>
                                )}
                                <button type="button" className="danger" onClick={() => handleDeleteImage(img.id)}>✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="admin-upload-zone">
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        <div className="admin-upload-zone-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                        <p>{uploading ? 'Uploading…' : <><strong>Click to upload</strong> or drag & drop</>}</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.6 }}>PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    </div>
                  </>
                )}

                {!editing && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--amuted)', margin: '0.5rem 0' }}>
                    💡 You can add images after saving the product by editing it.
                  </p>
                )}

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
                      editing ? 'Save Changes' : 'Create Product'
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
