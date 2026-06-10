import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import BrandLogo, { BRAND_TAGLINE } from '../../components/BrandLogo';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
];

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('lidya_admin_token');
    sessionStorage.removeItem('lidya_admin_token');
    navigate('/admin/login');
  };

  return (
    <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
      <div className="admin-sidebar-brand">
        <BrandLogo variant="mark" asLink={false} className="admin-sidebar-logo" />
        <span className="admin-brand-sub">{BRAND_TAGLINE}</span>
      </div>
      <nav className="admin-nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button type="button" className="admin-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
