import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export async function getProducts(params = {}) {
  const res = await api.get('/api/products', { params });
  return res.data.data;
}

export async function getProduct(slug) {
  const res = await api.get(`/api/products/${slug}`);
  return res.data.data;
}

export async function getCategories() {
  const res = await api.get('/api/categories');
  return res.data.data;
}

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}${path}`;
}

export async function placeGuestOrder({ email, first_name, last_name, phone, items }) {
  const res = await api.post('/api/orders/guest', {
    email,
    first_name,
    last_name,
    phone,
    items,
  });
  if (!res.data.success) {
    throw new Error(res.data.error || 'Order failed');
  }
  return res.data.data;
}

export default api;
