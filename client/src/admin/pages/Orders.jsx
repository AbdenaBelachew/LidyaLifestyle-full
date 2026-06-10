import React, { useEffect, useState } from 'react';
import api from '../api';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

function StatusBadge({ status }) {
  return <span className={`admin-badge admin-badge-${status}`}>{status}</span>;
}

function showToast(message) {
  const el = document.createElement('div');
  el.className = 'admin-toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const loadOrders = () => {
    api.get('/api/admin/orders')
      .then((res) => setOrders(res.data.data || []))
      .catch(() => showToast('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status });
      showToast(`Status updated to ${status}`);
      loadOrders();
    } catch {
      showToast('Status update failed');
    }
  };

  if (loading) return <div className="admin-loading">Loading orders…</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Orders</h1>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="admin-order-row" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <td>#{order.order_number || order.id}</td>
                  <td>{order.customer_email}</td>
                  <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
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
                        <h4>Order Items</h4>
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
                                <td>{item.product_name}</td>
                                <td>{item.quantity}</td>
                                <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                                <td>${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</td>
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
            {orders.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
