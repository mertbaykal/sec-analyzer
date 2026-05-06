/**
 * src/components/Layout.jsx
 * Shared layout: top nav, auth modal, page outlet
 */

import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user, login, register, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(email, password);
      else await login(email, password);
      setModalOpen(false);
      setEmail(''); setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const navStyle = ({ isActive }) => ({
    padding: '6px 16px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: '500',
    textDecoration: 'none',
    background: isActive ? 'var(--surface2)' : 'transparent',
    color: isActive ? 'var(--accent)' : 'var(--muted)',
    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.15s',
    fontFamily: 'var(--sans)',
    letterSpacing: '0.02em',
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Top Nav ── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 16 }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>🛡</div>
          Sec<span style={{ color: 'var(--accent)' }}>Analyzer</span>
        </div>

        <nav style={{ display: 'flex', gap: 4, background: 'var(--bg)', borderRadius: 10, padding: 4, border: '1px solid var(--border)' }}>
          <NavLink to="/" end style={navStyle}>Password</NavLink>
          <NavLink to="/network" style={navStyle}>Network</NavLink>
          <NavLink to="/history" style={navStyle}>History</NavLink>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)', animation: 'pulse 2s infinite' }} />
            ONLINE
          </div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)',
                background: 'rgba(99,220,180,0.08)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px' }}>
                ● {user.email.split('@')[0]}
              </span>
              <button onClick={logout} style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
                background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                padding: '6px 12px',
              }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setModalOpen(true)} style={{
              fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
              background: 'none', border: '1px solid var(--border)', borderRadius: 8,
              padding: '6px 14px', transition: 'border-color 0.2s, color 0.2s',
            }}>Login</button>
          )}
        </div>
      </header>

      {/* ── Page Content ── */}
      <main style={{ padding: '28px', maxWidth: 1100, margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* ── Auth Modal ── */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--surface)', border: '1px solid var(--border-bright)',
            borderRadius: 16, padding: 32, width: 380, position: 'relative',
          }}>
            <button onClick={() => setModalOpen(false)} style={{
              position: 'absolute', top: 12, right: 16, background: 'none',
              border: 'none', color: 'var(--muted)', fontSize: 20,
            }}>×</button>

            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 24 }}>
              // {isRegister ? 'register to save history' : 'login to your account'}
            </p>

            {error && (
              <div style={{ background: 'rgba(240,79,79,0.1)', border: '1px solid rgba(240,79,79,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth}>
              <input
                type="email" placeholder="email@university.edu" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 9, padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 13,
                  color: 'var(--text)', outline: 'none', marginBottom: 12 }}
              />
              <input
                type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 9, padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 13,
                  color: 'var(--text)', outline: 'none', marginBottom: 16 }}
              />
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px 24px', borderRadius: 10,
                background: 'var(--accent)', color: '#0a0d12', fontWeight: 700,
                fontSize: 13, border: 'none', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Please wait...' : (isRegister ? 'Create Account →' : 'Login →')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11,
              fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
              {isRegister ? 'Have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent2)',
                  fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer' }}>
                {isRegister ? 'Login' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
