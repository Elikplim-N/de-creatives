import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import './AdminLogin.css';

export default function AdminLogin() {
  const { adminLogin, loginError, isAdminLoggedIn, authLoading } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!authLoading && isAdminLoggedIn) navigate('/admin', { replace: true });
  }, [authLoading, isAdminLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Simulated auth delay
    const success = await adminLogin(form.username, form.password);
    setLoading(false);
    if (success) navigate('/admin');
  };

  return (
    <div className="admin-login" role="main">
      {/* Left Panel */}
      <div className="admin-login__panel admin-login__panel--left" aria-hidden="true">
        <img
          src="/products/tee-black-girl-palm.jpg"
          alt="DE Creatives"
          className="admin-login__bg"
        />
        <div className="admin-login__panel-overlay" />
        <div className="admin-login__panel-content">
          <img src="/logo.png" alt="DE Creatives" className="admin-login__brand-logo" />
          <blockquote className="admin-login__quote">
            "Define Your Creative. Made in Africa, Worn by the World."
            <cite>— Clan of DE Creatives</cite>
          </blockquote>
        </div>
      </div>

      {/* Right Panel */}
      <div className="admin-login__panel admin-login__panel--right">
        <div className="admin-login__form-wrap">
          {/* Header */}
          <div className="admin-login__header">
            <div className="admin-login__icon-wrap" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="admin-login__title">Admin Portal</h1>
            <p className="admin-login__subtitle">Secure access to DE Creatives management</p>
          </div>

          {/* Form */}
          <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
            {loginError && (
              <div className="admin-login__error" role="alert" aria-live="assertive">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {loginError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="admin-username" className="form-label">Email or Username</label>
              <div className="admin-login__input-wrap">
                <svg className="admin-login__input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="admin-username"
                  type="text"
                  className="form-input admin-login__input"
                  placeholder="Enter email or username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  autoComplete="username"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="admin-password" className="form-label">Password</label>
              <div className="admin-login__input-wrap">
                <svg className="admin-login__input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="admin-password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input admin-login__input"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  className="admin-login__pwd-toggle"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary admin-login__submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="admin-login__spinner" aria-label="Signing in..." />
              ) : (
                <>
                  Sign In Securely
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="admin-login__back">
            <a href="/">← Back to Storefront</a>
          </p>
        </div>
      </div>
    </div>
  );
}
