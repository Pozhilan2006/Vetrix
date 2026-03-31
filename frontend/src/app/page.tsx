'use client';

import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { connect, address, error } = useWallet();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    await connect();
    setIsConnecting(false);
  };

  if (address) {
    router.push('/chat');
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-black)',
      padding: 'var(--s-24)',
    }}>
      {/* Absolute Minimal Branding */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--s-64)' }}>
        <div style={{
          width: 96,
          height: 96,
          background: 'var(--accent-green)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: 900,
          color: '#000',
          margin: '0 auto var(--s-32)',
          boxShadow: '0 0 60px rgba(34, 197, 94, 0.2)',
        }}>
          N
        </div>
        <h1 className="fintech-heading" style={{ fontSize: '48px', letterSpacing: '-0.04em', fontWeight: 800 }}>
          Nexus
        </h1>
      </div>

      {/* Primary Action Only */}
      <div style={{ maxWidth: '320px', width: '100%', textAlign: 'center' }}>
        {error && (
          <div style={{
            padding: 'var(--s-16)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: 'var(--accent-red)',
            fontSize: '11px',
            marginBottom: 'var(--s-32)',
            fontWeight: 800,
            textTransform: 'uppercase',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          style={{
            width: '100%',
            padding: 'var(--s-20)',
            borderRadius: '16px',
            background: isConnecting ? 'var(--accent-green-h)' : 'var(--accent-green)',
            border: 'none',
            color: '#000',
            fontSize: '14px',
            fontWeight: 900,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--s-12)',
          }}
        >
          {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
      </div>
    </div>
  );
}
