'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import BalanceCard from '@/components/BalanceCard';
import TokenList from '@/components/TokenList';
import ChatPanel from '@/components/ChatPanel';
import InsightsPanel from '@/components/InsightsPanel';
import TransactionHistory from '@/components/TransactionHistory';
import { useWallet } from '@/context/WalletContext';

export default function WalletPage() {
  const { balances, loading } = useWallet();

  return (
    <DashboardLayout>
      <div style={{
        flex: 1,
        padding: '0 var(--s-32) var(--s-32)',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 'var(--s-32)',
        height: '100%', 
        overflow: 'hidden',
      }}>
        
        {/* Center Column: Full Portfolio & Analytics (span 8) */}
        <div style={{
          gridColumn: 'span 8',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          paddingRight: 'var(--s-8)',
          gap: 'var(--s-32)',
        }} className="scrollbar-hidden">
          
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <BalanceCard balances={balances} loading={loading} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--s-32)',
          }}>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <TokenList tokens={balances} loading={loading} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <InsightsPanel />
              <div style={{ marginTop: 'var(--s-32)' }}>
                <TransactionHistory />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant (span 4) */}
        <div style={{
          gridColumn: 'span 4',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}>
          <div className="animate-fade-in" style={{ height: '100%', animationDelay: '0.4s' }}>
            <ChatPanel />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
