import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const EMPTY_FORM = {
  name: '', slug: '', short_description: '', description: '',
  price: '', category_id: '', stock_qty: '', sku: '',
  is_featured: false, is_active: true,
};

function showToast(message) {
  const el = document.createElement('div');
  el.className = 'admin-toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
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

  const loadProducts = useCallback(() => {
    api.get('/api/products', { params: { limit: 200 } })
      .then((res) => setProducts(res.data.data.products || []))
      .catch(() => showToast('Failed to load products'))
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
    setForm((f) => ({
      ...f,
      name,
      slug: editing ? f.slug : slugify(name),
    }));
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
        showToast('Product updated');
      } else {
        await api.post('/api/products', payload);
        showToast('Product created');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    if (!editing || !e.target.files[0]) return;
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    try {
      const res = await api.post(`/api/products/${editing.id}/images`, fd);
      setImages(res.data.data || []);
      showToast('Image uploaded');
    } catch {
      showToast('Upload failed');
    }
    e.target.value = '';
  };

  const handleDeleteImage = async (imageId) => {
    if (!editing) return;
    try {
      const res = await api.delete(`/api/products/${editing.id}/images/${imageId}`);
      setImages(res.data.data || []);
      showToast('Image deleted');
    } catch {
      showToast('Delete failed');
    }
  };

  const handleSetPrimary = async (imageId) => {
    if (!editing) return;
    try {
      const res = await api.put(`/api/products/${editing.id}/images/${imageId}/primary`);
      setImages(res.data.data || []);
    } catch {
      showToast('Failed to set primary');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      showToast('Product deleted');
      loadProducts();
    } catch {
      showToast('Delete failed');
    }
  };

  if (loading) return <div className="admin-loading">Loading products…</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Products</h1>
        <button type="button" className="admin-btn-primary" onClick={openCreate}>Add Product</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td>{p.stock_qty}</td>
                <td>{p.is_featured ? 'Yes' : 'No'}</td>
                <td>{p.is_active ? 'Yes' : 'No'}</td>
                <td className="admin-actions">
                  <button type="button" className="admin-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  <button type="button" className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
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
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <label>Name<input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required /></label>
              <label>Slug<input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required /></label>
              <label>Short Description<input value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} /></label>
              <label>Description<textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></label>
              <div className="admin-form-row">
                <label>Price<input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required /></label>
                <label>Stock<input type="number" value={form.stock_qty} onChange={(e) => setForm((f) => ({ ...f, stock_qty: e.target.value }))} /></label>
              </div>
              <label>
                Category
                <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label>SKU<input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} /></label>
              <div className="admin-form-checks">
                <label><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} /> Featured</label>
                <label><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active</label>
              </div>

              {editing && (
                <div className="admin-images-section">
                  <h3>Images</h3>
                  <div className="admin-images-grid">
                    {images.map((img) => (
                      <div key={img.id} className="admin-image-thumb">
                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img.image_path}`} alt="" />
                        {img.is_primary && <span className="admin-primary-badge">Primary</span>}
                        <div className="admin-image-actions">
                          {!img.is_primary && (
                            <button type="button" className="admin-btn-sm" onClick={() => handleSetPrimary(img.id)}>Set Primary</button>
                          )}
                          <button type="button" className="admin-btn-sm admin-btn-danger" onClick={() => handleDeleteImage(img.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label className="admin-upload-btn">
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                  </label>
                </div>
              )}

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
