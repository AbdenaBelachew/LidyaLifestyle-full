import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import BrandLogo, { BRAND_TAGLINE } from '../../components/BrandLogo';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lidya_admin_token') || sessionStorage.getItem('lidya_admin_token');
    if (token) navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (!res.data.success) {
        setError('Login failed');
        return;
      }

      const { token, user } = res.data.data;
      if (user.role !== 'admin') {
        setError('This account does not have admin access. Please use the storefront to shop.');
        return;
      }

      localStorage.removeItem('lidya_admin_token');
      sessionStorage.removeItem('lidya_admin_token');
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('lidya_admin_token', token);

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-brand">
        <div className="admin-login-brand-inner">
          <BrandLogo variant="admin" asLink={false} showTagline />
          <h1>Admin Portal</h1>
          <p className="admin-login-brand-text">{BRAND_TAGLINE}</p>
          <div className="admin-login-pattern" aria-hidden="true" />
        </div>
      </div>

      <div className="admin-login-panel">
        <div className="admin-login-form-wrap">
          <Link to="/" className="admin-login-back">← Back to store</Link>

          <div className="admin-login-header">
            <h2>Welcome back</h2>
            <p>Sign in with your administrator credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="admin-login-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <label className="admin-login-field">
              <span>Email address</span>
              <div className="admin-login-input-wrap">
                <svg className="admin-login-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 6h16v12H4z" />
                  <path d="M4 7l8 6 8-6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lidya.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </label>

            <label className="admin-login-field">
              <span>Password</span>
              <div className="admin-login-input-wrap">
                <svg className="admin-login-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="11" width="14" height="10" rx="1" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-login-toggle-pw"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 3l18 18M10.5 10.7a2 2 0 002.8 2.8M7.2 7.4C5.5 8.6 4.2 10.2 3 12c2.5 4 6.5 6 9 6 1.4 0 2.8-.4 4.1-1.2M14 5.5C15.2 5.2 16.6 5 18 5c2.5 0 6.5 2 9 6-1 1.6-2.2 3-3.6 4.1" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <label className="admin-login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Keep me signed in
            </label>

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="admin-login-spinner" />
                  Signing in…
                </>
              ) : (
                'Sign in to Admin'
              )}
            </button>
          </form>

          <p className="admin-login-footer-note">
            Admin access only. Customers can checkout without an account on the storefront.
          </p>
        </div>
      </div>
    </div>
  );
}
