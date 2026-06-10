import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import api from './api';

function getAdminToken() {
  return localStorage.getItem('lidya_admin_token') || sessionStorage.getItem('lidya_admin_token');
}

export default function AdminApp() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    api.get('/api/admin/dashboard')
      .then(() => setReady(true))
      .catch(() => {
        localStorage.removeItem('lidya_admin_token');
        sessionStorage.removeItem('lidya_admin_token');
        navigate('/admin/login', { replace: true });
      });
  }, [navigate]);

  if (!ready) {
    return (
      <div className="admin-login-page">
        <div className="admin-loading">Verifying admin session…</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
