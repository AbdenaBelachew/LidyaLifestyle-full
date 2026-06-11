import React from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_INFO = {
  '/admin/dashboard': {
    title: 'Dashboard',
    icon: 'dashboard',
    description: 'Welcome back to your admin panel',
  },
  '/admin/products': {
    title: 'Products',
    icon: 'products',
    description: 'Manage your product catalog',
  },
  '/admin/categories': {
    title: 'Categories',
    icon: 'categories',
    description: 'Organize your product categories',
  },
  '/admin/orders': {
    title: 'Orders',
    icon: 'orders',
    description: 'View and manage customer orders',
  },
};

export default function AdminNavbar() {
  const location = useLocation();
  const pageInfo = PAGE_INFO[location.pathname] || { title: 'Admin', description: '' };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-content">
        <div className="admin-navbar-left">
          <h1 className="admin-navbar-title">{pageInfo.title}</h1>
          <p className="admin-navbar-subtitle">{pageInfo.description}</p>
        </div>

        <div className="admin-navbar-right">
          <div className="admin-navbar-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="admin-navbar-search-input"
            />
          </div>

          <button className="admin-navbar-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="admin-navbar-badge">3</span>
          </button>

          <button className="admin-navbar-btn" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m3.08-3.08l4.24-4.24M19.78 19.78l-4.24-4.24m-3.08-3.08l-4.24-4.24" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
