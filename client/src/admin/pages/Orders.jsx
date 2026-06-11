import React, { useEffect, useState } from 'react';
import api from '../api';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_ICONS = {
  pending:    '🕐',
  paid:       '💳',
  processing: '⚙️',
  shipped:    '📦',
  delivered:  '✅',
  cancelled:  '✕',
};

function StatusBadge({ status }) {
  return <span className={`admin-badge admin-badge-${status}`}>{STATUS_ICONS[status] || ''} {status}</span>;
}

function showToast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = 'admin-toast';
  if (type === 'error') el.style.borderColor = 'rgba(239,68,68,0.4)';
  el.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const loadOrders = () => {
    api.get('/api/admin/orders')
      .then((res) => setOrders(res.data.data || []))
      .catch(() => showToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status });
      showToast(`Order status → ${status}`);
      loadOrders();
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = !filterStatus || o.status === filterStatus;
    const matchSearch = !search
      || String(o.order_number || o.id).includes(search)
      || (o.customer_email || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      Loading orders…
    </div>
  );

  return (
    <div className="admin-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-page-title">Orders</h1>
        <p className="admin-page-subtitle">
          {orders.length} total orders · ${totalRevenue.toFixed(2)} total revenue
        </p>
      </div>

      {/* Quick status chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilterStatus('')}
          style={{
            padding: '0.3rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid',
            fontFamily: 'inherit',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            background: !filterStatus ? 'var(--ap)' : 'transparent',
            borderColor: !filterStatus ? 'var(--ap)' : 'var(--aborder)',
            color: !filterStatus ? '#0d0e12' : 'var(--amuted)',
          }}
        >
          All ({orders.length})
        </button>
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              style={{
                padding: '0.3rem 0.9rem',
                borderRadius: '20px',
                border: '1px solid',
                fontFamily: 'inherit',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: filterStatus === s ? 'rgba(212,168,90,0.15)' : 'transparent',
                borderColor: filterStatus === s ? 'var(--ap)' : 'var(--aborder)',
                color: filterStatus === s ? 'var(--ap)' : 'var(--amuted)',
              }}
            >
              {STATUS_ICONS[s]} {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="admin-search-input"
            placeholder="Search by order # or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  className="admin-order-row"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <td style={{ fontWeight: 700 }}>
                    <span style={{ color: 'var(--ap)', marginRight: 6, fontSize: '0.8rem' }}>
                      {expanded === order.id ? '▾' : '▸'}
                    </span>
                    #{order.order_number || order.id}
                  </td>
                  <td style={{ color: 'var(--amuted)' }}>{order.customer_email}</td>
                  <td style={{ fontWeight: 700 }}>${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td style={{ color: 'var(--amuted)', fontSize: '0.82rem' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="admin-status-select"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                {expanded === order.id && (
                  <tr className="admin-order-items-row">
                    <td colSpan={6}>
                      <div className="admin-order-items">
                        <div className="admin-order-items-header">
                          📋 Order Items · {(order.items || []).length} item(s)
                        </div>
                        <table className="admin-table admin-table-nested">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Qty</th>
                              <th>Unit Price</th>
                              <th>Line Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((item) => (
                              <tr key={item.id}>
                                <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                                <td>{item.quantity}</td>
                                <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                                <td style={{ fontWeight: 600, color: 'var(--ap)' }}>
                                  ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty">
                    <div className="admin-empty-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                        <rect x="9" y="3" width="6" height="4" rx="1"/>
                      </svg>
                    </div>
                    {search || filterStatus ? 'No orders match your filter' : 'No orders yet'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
