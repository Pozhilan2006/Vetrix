'use client';

import React from 'react';

interface IntentData {
  action: string;
  chain: string | null;
  asset: string | null;
  amount: string | null;
  to_address: string | null;
  tokenAddress: string | null;
  gasEstimate: string | null;
  gasPriceGwei: string | null;
  confidence: number;
  risk_flags: string[];
  human_readable_summary?: string;
}

interface TransactionCardProps {
  intent: IntentData;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting: boolean;
}

const shortenAddress = (addr: string) =>
  addr.length > 14 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

const ACTION_LABELS: Record<string, string> = {
  send_eth:   'Send ETH',
  send_token: 'Token Transfer',
  swap:       'Swap',
  transfer:   'Transfer',
};

const TransactionCard: React.FC<TransactionCardProps> = ({
  intent,
  onConfirm,
  onCancel,
  isExecuting,
}) => {
  const label = ACTION_LABELS[intent.action] ?? intent.action?.replace(/_/g, ' ') ?? 'Transaction';
  const hasRisks = intent.risk_flags && intent.risk_flags.length > 0;

  return (
    <div
      className="animate-slide-up fintech-card"
      style={{ width: '100%', overflow: 'hidden', border: '1px solid var(--accent-green)' }}
    >
      {/* Header */}
      <div style={{
        padding: 'var(--s-12) var(--s-16)',
        borderBottom: '1px solid var(--border-neutral)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(34,197,94,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-8)' }}>
          <span style={{ fontSize: '14px' }}>🛡️</span>
          <span className="text-label" style={{ color: 'var(--accent-green)', fontSize: '10px' }}>
            {label}
          </span>
        </div>
        <div style={{
          fontSize: '10px',
          fontWeight: 800,
          color: intent.confidence >= 0.9 ? 'var(--accent-green)' : 'var(--accent-yellow)',
          background: 'rgba(255,255,255,0.03)',
          padding: '2px 6px',
          borderRadius: '4px',
        }}>
          {Math.round(intent.confidence * 100)}% CONFIDENCE
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--s-16)', display: 'flex', flexDirection: 'column', gap: 'var(--s-12)' }}>
        
        {/* Amount Hero */}
        <div style={{
          padding: 'var(--s-16)',
          background: 'var(--bg-black)',
          border: '1px solid var(--border-neutral)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p className="text-label" style={{ marginBottom: 'var(--s-8)', opacity: 0.5 }}>Transfer Amount</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'var(--s-8)' }}>
            <span className="mono" style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
              {intent.amount}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-green)' }}>
              {intent.asset?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Details List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          {intent.to_address && (
            <Row label="Recipient">
              <span className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {shortenAddress(intent.to_address)}
              </span>
            </Row>
          )}
          
          <Row label="Network">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{intent.chain ?? 'Sepolia'}</span>
            </div>
          </Row>

          <Row label="Estimated Gas">
            <span className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {intent.gasEstimate ?? '0.00021'} ETH
            </span>
          </Row>

          <Row label="Final Balance (Est.)">
            <span className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              --
            </span>
          </Row>
        </div>

        {/* Risk Warning */}
        {hasRisks && (
          <div style={{
            padding: 'var(--s-12)',
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '8px',
          }}>
            <p className="text-label" style={{ color: 'var(--accent-red)', marginBottom: 'var(--s-4)' }}>Security Warnings</p>
            {intent.risk_flags.map((flag, i) => (
              <p key={i} style={{ fontSize: '11px', color: 'var(--accent-red)', opacity: 0.8, lineHeight: 1.4 }}>
                • {flag}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: '0 var(--s-16) var(--s-16)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--s-12)',
      }}>
        <button
          onClick={onCancel}
          disabled={isExecuting}
          className="fintech-card"
          style={{
            padding: 'var(--s-12)',
            border: '1px solid var(--border-neutral)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-red)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-neutral)'}
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          disabled={isExecuting}
          style={{
            padding: 'var(--s-12)',
            borderRadius: '16px',
            background: isExecuting ? 'var(--accent-green-h)' : 'var(--accent-green)',
            border: 'none',
            color: '#000',
            fontSize: '13px',
            fontWeight: 800,
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {isExecuting ? 'SIGNING...' : 'CONFIRM'}
        </button>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
  }}>
    <span className="text-label" style={{ fontSize: '9px', opacity: 0.6 }}>{label}</span>
    <div>{children}</div>
  </div>
);

export default TransactionCard;
