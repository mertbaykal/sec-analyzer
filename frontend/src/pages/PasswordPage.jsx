/**
 * src/pages/PasswordPage.jsx
 * Main password strength analysis page
 * Calls backend API for full analysis; also runs client-side preview
 */

import React, { useState, useCallback } from 'react';
import { analyzePassword, getStrengthColor } from '../utils/passwordAnalyzer';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const CRITERIA = [
  { key: 'hasMinLength',  label: 'At least 8 characters' },
  { key: 'hasUppercase',  label: 'Uppercase letters (A–Z)' },
  { key: 'hasLowercase',  label: 'Lowercase letters (a–z)' },
  { key: 'hasNumbers',    label: 'Numbers (0–9)' },
  { key: 'hasSymbols',    label: 'Special characters (!@#$...)' },
  { key: 'hasGoodLength', label: '12+ characters (recommended)' },
];

export default function PasswordPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setPassword(val);
    setSaved(false);
    setResult(val ? analyzePassword(val) : null);
  }, []);

  const saveToHistory = async () => {
    if (!result || !user) return;
    const masked = password.slice(0, 3) + '•'.repeat(Math.max(password.length - 3, 1));
    try {
      await api.post('/history', {
        maskedPassword: masked,
        score: result.score,
        strength: result.strength,
        entropy: result.entropy,
        length: password.length,
        hasUppercase: result.criteria.hasUppercase,
        hasLowercase: result.criteria.hasLowercase,
        hasNumbers: result.criteria.hasNumbers,
        hasSymbols: result.criteria.hasSymbols,
        isCommonPassword: result.isCommon,
        crackTimeEstimate: result.crackTime,
      });
      setSaved(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    }
  };

  const color = result ? getStrengthColor(result.strength) : 'var(--muted)';

  return (
    <div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
        Module 01
      </p>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 24 }}>
        Password Strength Analyzer
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Left: Input Panel ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'block', width: 3, height: 14, background: 'var(--accent)', borderRadius: 2 }} />
            Input & Analysis
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={handleChange}
              placeholder="Enter password to analyze..."
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 48px 14px 18px',
                fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text)', outline: 'none' }}
            />
            <button onClick={() => setShowPwd(s => !s)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16,
            }}>{showPwd ? '🙈' : '👁'}</button>
          </div>

          {/* Strength Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
              {result ? result.strength : '—'}
            </span>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
              entropy: {result ? result.entropy : '—'} bits
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', borderRadius: 99, background: color,
              width: result ? `${result.score}%` : '0%', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.4s' }} />
          </div>

          {/* Criteria */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {CRITERIA.map(c => {
              const pass = result?.criteria[c.key];
              return (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 13, fontFamily: 'var(--mono)', color: pass ? 'var(--accent)' : 'var(--muted)' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0,
                    background: pass ? 'rgba(99,220,180,0.15)' : 'transparent',
                    border: `1.5px solid ${pass ? 'var(--accent)' : 'var(--muted)'}`,
                    color: pass ? 'var(--accent)' : 'transparent',
                  }}>✓</div>
                  {c.label}
                </div>
              );
            })}
          </div>

          {/* Common Password Warning */}
          {result?.isCommon && (
            <div style={{ background: 'rgba(240,79,79,0.08)', border: '1px solid rgba(240,79,79,0.25)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 12,
              fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--danger)', display: 'flex', gap: 8 }}>
              ⚠ This password appears in common password lists!
            </div>
          )}

          {/* Feedback */}
          {result?.feedback?.length > 0 && (
            <div style={{ background: 'rgba(59,140,248,0.07)', border: '1px solid rgba(59,140,248,0.2)',
              borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--accent2)', marginBottom: 8 }}>
                Recommendations
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {result.feedback.map((tip, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'rgba(232,237,245,0.75)',
                    fontFamily: 'var(--mono)', paddingLeft: 14, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent2)' }}>{'>'}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Right: Stats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'block', width: 3, height: 14, background: 'var(--accent)', borderRadius: 2 }} />
              Metrics
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Length',  val: result ? password.length : '—' },
                { label: 'Entropy', val: result ? result.entropy : '—' },
                { label: 'Score',   val: result ? result.score : '—' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charset bars */}
            {[
              { label: 'Uppercase', count: result?.composition.upperCount || 0, color: 'var(--accent2)' },
              { label: 'Lowercase', count: result?.composition.lowerCount || 0, color: 'var(--accent)' },
              { label: 'Numbers',   count: result?.composition.numCount   || 0, color: 'var(--warn)' },
              { label: 'Special',   count: result?.composition.symCount   || 0, color: 'var(--danger)' },
            ].map(bar => {
              const pct = password.length ? Math.min((bar.count / password.length) * 100, 100) : 0;
              return (
                <div key={bar.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 4 }}>
                    <span>{bar.label}</span><span>{bar.count} chars</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: bar.color, borderRadius: 99, width: `${pct}%`, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk Assessment */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'block', width: 3, height: 14, background: 'var(--accent)', borderRadius: 2 }} />
              Risk Assessment
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 8 }}>Overall Risk Level</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 6, background: `${color}20`, color }}>
                  {result ? (result.score >= 80 ? 'Minimal' : result.score >= 60 ? 'Low' : result.score >= 40 ? 'Medium' : result.score >= 20 ? 'High' : 'Critical') + ' Risk' : 'Awaiting input'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>Crack Time Est.</div>
                <div style={{ fontSize: 13, fontFamily: 'var(--mono)' }}>{result?.crackTime || '—'}</div>
              </div>
            </div>
          </div>

          {/* Save button (only for logged-in users) */}
          {user && result && (
            <button onClick={saveToHistory} style={{
              padding: '12px 24px', borderRadius: 10, background: saved ? 'rgba(99,220,180,0.15)' : 'var(--accent)',
              color: saved ? 'var(--accent)' : '#0a0d12', fontWeight: 700, fontSize: 13, border: saved ? '1px solid var(--accent)' : 'none',
              transition: 'all 0.2s',
            }}>
              {saved ? '✓ Saved to History' : 'Save to History ↗'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
