import React from 'react';
import { useLocation } from 'react-router-dom';
import BrandLogo from '../../components/BrandLogo';
import { useAdminTheme } from '../context/ThemeContext';

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
  const { theme, toggle } = useAdminTheme();

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-content">
        <div className="admin-navbar-brand">
          <BrandLogo variant="mark" asLink={false} />
        </div>
        <div className="admin-navbar-left">
          <h1 className="admin-navbar-title">{pageInfo.title}</h1>
          <p className="admin-navbar-subtitle">{pageInfo.description}</p>
        </div>

        <div className="admin-navbar-right">
         

         

          <button className="admin-theme-toggle" onClick={toggle} title="Toggle theme">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            )}
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
