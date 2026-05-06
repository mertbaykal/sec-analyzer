/**
 * src/pages/NetworkPage.jsx
 * Simulated network port scanner — educational only
 */

import React, { useState } from 'react';
import api from '../utils/api';

const RISK_COLORS = {
  none:     'var(--accent)',
  low:      'var(--accent)',
  medium:   'var(--warn)',
  high:     '#f5803a',
  critical: 'var(--danger)',
};

export default function NetworkPage() {
  const [target, setTarget]     = useState('');
  const [scanType, setScanType] = useState('quick');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  const runScan = async () => {
    if (!target.trim()) { setError('Please enter an IP address or domain.'); return; }
    setError('');
    setScanning(true);
    setResult(null);
    setProgress(0);

    // Animate progress bar
    const timer = setInterval(() => {
      setProgress(p => Math.min(p + 3, 97));
    }, 75);

    try {
      const res = await api.post('/network/scan', { target: target.trim(), scanType });
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => { setResult(res.data); setScanning(false); }, 300);
    } catch (err) {
      clearInterval(timer);
      setScanning(false);
      setError(err.response?.data?.error || 'Scan failed. Check target format.');
    }
  };

  return (
    <div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
        Module 02
      </p>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 24 }}>
        Network Security Scanner
      </h1>

      {/* Disclaimer */}
      <div style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.2)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
        fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--warn)' }}>
        ⚠ EDUCATIONAL SIMULATION — No real network scanning is performed. All results are simulated for demonstration purposes.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Left: Config ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'block', width: 3, height: 14, background: 'var(--accent)', borderRadius: 2 }} />
            Target Configuration
          </div>

          <label style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', display: 'block', marginBottom: 8 }}>
            IP Address or Domain
          </label>
          <input value={target} onChange={e => setTarget(e.target.value)} onKeyDown={e => e.key === 'Enter' && runScan()}
            placeholder="e.g. 192.168.1.1 or example.com"
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text)', outline: 'none', marginBottom: 16 }} />

          <label style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', display: 'block', marginBottom: 10 }}>
            Scan Type
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['quick','Quick Scan'],['full','Full Scan'],['vuln','Vuln Check']].map(([t, label]) => (
              <button key={t} onClick={() => setScanType(t)} style={{
                flex: 1, padding: 10, borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer',
                background: scanType === t ? 'rgba(99,220,180,0.08)' : 'transparent',
                border: scanType === t ? '1px solid rgba(99,220,180,0.3)' : '1px solid var(--border)',
                color: scanType === t ? 'var(--accent)' : 'var(--muted)',
                transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>

          {error && (
            <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--danger)',
              background: 'rgba(240,79,79,0.08)', border: '1px solid rgba(240,79,79,0.2)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button onClick={runScan} disabled={scanning} style={{
            width: '100%', padding: '12px 24px', borderRadius: 10, border: '1px solid var(--accent2)',
            background: 'transparent', color: 'var(--accent2)', fontWeight: 700, fontSize: 13,
            opacity: scanning ? 0.5 : 1,
          }}>
            {scanning ? 'Scanning...' : 'Run Simulation →'}
          </button>

          {/* Progress bar */}
          {scanning && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)' }}>
              <span>Scanning</span>
              <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 99, width: `${progress}%`, transition: 'width 0.1s' }} />
              </div>
              <span>{progress}%</span>
            </div>
          )}

          {/* Port grid */}
          {result && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Open Ports Detected
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.ports.map(p => {
                  const c = RISK_COLORS[p.risk];
                  return (
                    <div key={p.port} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: `${c}08`, border: `1px solid ${c}40`,
                      borderRadius: 8, padding: '8px 12px',
                      fontFamily: 'var(--mono)', fontSize: 11, color: c,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                      :{p.port} <span style={{ opacity: 0.6 }}>{p.service.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Right: Results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary stats */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'block', width: 3, height: 14, background: 'var(--accent)', borderRadius: 2 }} />
              Scan Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { label: 'Open Ports', val: result?.summary.totalOpen ?? '—' },
                { label: 'Risk Ports', val: result?.summary.riskPorts ?? '—' },
                { label: 'Services',   val: result?.summary.services?.length ?? '—' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Service detail */}
          {result && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'block', width: 3, height: 14, background: 'var(--accent)', borderRadius: 2 }} />
                Service Detection
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.ports.map(p => {
                  const c = RISK_COLORS[p.risk];
                  return (
                    <div key={p.port} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>Port {p.port} / {p.protocol}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{p.service}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                        padding: '3px 10px', borderRadius: 6, background: `${c}18`, color: c, letterSpacing: '0.08em' }}>
                        {p.risk}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risk indicators */}
          {result?.ports.filter(p => ['high','critical'].includes(p.risk)).length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'block', width: 3, height: 14, background: 'var(--danger)', borderRadius: 2 }} />
                Risk Indicators
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.ports.filter(p => ['high','critical'].includes(p.risk)).map(p => (
                  <div key={p.port} style={{ display: 'flex', gap: 10, padding: '10px 12px',
                    background: 'rgba(240,79,79,0.04)', border: '1px solid rgba(240,79,79,0.12)', borderRadius: 8 }}>
                    <span style={{ color: 'var(--danger)', fontFamily: 'var(--mono)', fontSize: 11 }}>⚠</span>
                    <div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--danger)' }}>Port {p.port} — {p.service}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{p.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
