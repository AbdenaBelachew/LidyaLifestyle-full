import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../admin.css';

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
};

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Admin';

  return (
    <div className="admin-root">
      {/* Mobile hamburger */}
      <button
        type="button"
        className="admin-hamburger"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
