/**
 * src/pages/HistoryPage.jsx
 * Shows saved password analysis history — requires login
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const STRENGTH_COLORS = {
  CRITICAL: '#f04f4f', WEAK: '#f5803a',
  FAIR: '#f5a623',     GOOD: '#7cc96b', STRONG: '#63dcb4',
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/history')
      .then(res => setRecords(res.data.records))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const deleteRecord = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setRecords(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all history?')) return;
    try {
      await api.delete('/history');
      setRecords([]);
    } catch (err) {
      alert('Failed to clear');
    }
  };

  return (
    <div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
        Module 03
      </p>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 24 }}>
        Analysis History
      </h1>

      {!user ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Login Required</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            Authenticated users can save and view password analysis history.
            Click <strong>Login</strong> in the top navigation.
          </div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
          Loading history...
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>
              {records.length} records
            </span>
            {records.length > 0 && (
              <button onClick={clearAll} style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--danger)',
                background: 'none', border: '1px solid rgba(240,79,79,0.3)',
                borderRadius: 7, padding: '5px 12px', cursor: 'pointer',
              }}>Clear All</button>
            )}
          </div>

          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>
              No history yet. Analyze a password and click "Save to History".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {records.map(r => {
                const c = STRENGTH_COLORS[r.strength] || 'var(--muted)';
                return (
                  <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.08em', marginBottom: 4 }}>
                        {r.maskedPassword}
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                        {new Date(r.checkedAt).toLocaleString()} · length {r.length} · entropy {r.entropy} bits · crack: {r.crackTimeEstimate}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                        padding: '4px 10px', borderRadius: 6, background: `${c}18`, color: c,
                        border: `1px solid ${c}40`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {r.strength}
                      </div>
                      <button onClick={() => deleteRecord(r._id)} style={{
                        background: 'none', border: 'none', color: 'var(--muted)',
                        cursor: 'pointer', fontSize: 16, lineHeight: 1,
                      }}>×</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
