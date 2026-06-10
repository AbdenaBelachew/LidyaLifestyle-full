import React, { useEffect, useState } from 'react';
import api from '../api';

function StatusBadge({ status }) {
  return <span className={`admin-badge admin-badge-${status}`}>{status}</span>;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading dashboard…</div>;
  if (error) return <div className="admin-error">{error}</div>;

  const recentOrders = (data.recentOrders || []).slice(0, 5);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Products</span>
          <span className="admin-stat-value">{data.totalProducts}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Orders</span>
          <span className="admin-stat-value">{data.totalOrders}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Customers</span>
          <span className="admin-stat-value">{data.totalCustomers}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Order Statuses</span>
          <div className="admin-status-summary">
            {(data.ordersByStatus || []).map((s) => (
              <span key={s.status} className="admin-status-chip">
                {s.status}: {s.count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2>Recent Orders</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_email}</td>
                  <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="admin-empty">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
