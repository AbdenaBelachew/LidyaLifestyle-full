import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function StatusBadge({ status }) {
  return <span className={`admin-badge admin-badge-${status}`}>{status}</span>;
}

function StatCard({ label, value, icon, colorClass, subtitle }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${colorClass}`}>{icon}</div>
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-value">{value}</span>
      {subtitle && <div className="admin-stat-trend">{subtitle}</div>}
    </div>
  );
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

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      Loading dashboard…
    </div>
  );

  if (error) return <div className="admin-error-msg">{error}</div>;

  const recentOrders = (data.recentOrders || []).slice(0, 6);
  const revenue = recentOrders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

  return (
    <div className="admin-page">
      

      {/* Stat Cards */}
      <div className="admin-stats">
        <StatCard
          label="Total Products"
          value={data.totalProducts ?? '—'}
          colorClass="gold"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={data.totalOrders ?? '—'}
          colorClass="blue"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
          }
        />
        <StatCard
          label="Customers"
          value={data.totalCustomers ?? '—'}
          colorClass="green"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          }
        />
        <StatCard
          label="Recent Revenue"
          value={`$${revenue.toFixed(0)}`}
          colorClass="amber"
          subtitle="From last 6 orders"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          }
        />
      </div>

    

      {/* Recent Orders Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Orders</h3>
          <Link to="/admin/orders" className="admin-view-all">View all →</Link>
        </div>
        <div className="admin-table-wrap" style={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td data-label="Order" style={{ fontWeight: 600 }}>#{order.order_number || order.id}</td>
                  <td data-label="Customer" style={{ color: 'var(--amuted)' }}>{order.customer_email}</td>
                  <td data-label="Total" style={{ fontWeight: 600 }}>${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td data-label="Status"><StatusBadge status={order.status} /></td>
                  <td data-label="Date" style={{ color: 'var(--amuted)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="1"/>
                        </svg>
                      </div>
                      No orders yet
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
