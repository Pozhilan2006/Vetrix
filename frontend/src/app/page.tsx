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
    <div className="bg-dot-grid" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-black)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Cinematic Orbs */}
      <div className="glow-orb" style={{ top: '-10%', left: '-10%', opacity: 0.8 }} />
      <div className="glow-orb" style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)', animationDelay: '-5s' }} />

      {/* Hero Section */}
      <div className="animate-slide-up" style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
        padding: '0 var(--s-32)',
      }}>
        
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          borderRadius: '100px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-green)',
          marginBottom: '24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
        }}>
          Nexus Autonomous Framework v3.0
        </div>

        <h1 style={{
          fontSize: 'calc(48px + 2vw)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: '24px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A1A1A1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Abstracting the Blockchain.
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '48px' }}>
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            A unified AI interface designed to eliminate Web3 cognitive overload.
          </p>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            fontWeight: 400,
          }}>
            Understands natural language. Executes autonomously.
          </p>
        </div>

        {/* Primary Action */}
        <div style={{ maxWidth: '320px', margin: '0 auto' }}>
          {error && (
            <div className="animate-fade-in" style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              color: 'var(--accent-red)',
              fontSize: '12px',
              marginBottom: '24px',
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            {/* Soft glow behind button */}
            <div style={{
              position: 'absolute',
              inset: '-8px',
              background: 'var(--accent-green)',
              filter: 'blur(24px)',
              opacity: 0.15,
              borderRadius: '24px',
              transition: 'opacity 0.2s',
            }} />
            
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="fintech-card-hover"
              style={{
                position: 'relative',
                width: '100%',
                padding: '24px 32px',
                borderRadius: '100px',
                background: isConnecting ? 'var(--text-secondary)' : 'var(--text-primary)',
                border: 'none',
                color: '#000',
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 8px 32px rgba(255,255,255,0.1)'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnecting ? '#000' : 'var(--accent-green)',
                boxShadow: isConnecting ? 'none' : '0 0 12px var(--accent-green)',
                animation: 'fade-in 1.5s infinite alternate'
              }} />
              {isConnecting ? 'ESTABLISHING SECURE LINK...' : 'CONNECT METAMASK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
