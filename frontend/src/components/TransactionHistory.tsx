'use client';

import React from 'react';
import { useWallet } from '../context/WalletContext';

const TransactionHistory: React.FC = () => {
  const { history, loading } = useWallet();

  if (loading && history.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-16)', marginTop: 'var(--s-24)' }}>
      <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        Wallet Activity
      </h4>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '48px' }} />)}
    </div>
  );

  return (
    <div style={{ marginTop: 'var(--s-24)' }}>
      <h4 style={{ 
        fontSize: '11px', 
        fontWeight: 700, 
        textTransform: 'uppercase', 
        color: 'var(--text-muted)', 
        marginBottom: 'var(--s-16)',
        letterSpacing: '0.05em'
      }}>
        Wallet Activity
      </h4>
      
      {history.length === 0 ? (
        <div style={{
          padding: 'var(--s-32)',
          textAlign: 'center',
          border: '1px solid var(--border-neutral)',
          borderRadius: '12px',
          background: 'var(--bg-black)',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
            No recent activity found.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-neutral)' }}>
          {history.map((tx, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--s-12) 0',
              borderBottom: '1px solid var(--border-neutral)',
            }}>
              {/* Type (Left Aligned) */}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: tx.category === 'external' ? 'var(--accent-red)' : 'var(--accent-green)', letterSpacing: '0.02em' }}>
                  {tx.category === 'external' ? 'SEND' : 'RECEIVE'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                </div>
              </div>

              {/* Amount (Right Aligned) */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: tx.category === 'external' ? 'var(--accent-red)' : 'var(--accent-green)' 
                }}>
                  {tx.category === 'external' ? '-' : '+'}{parseFloat(tx.value).toFixed(4)} {tx.asset}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Confirmed
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
