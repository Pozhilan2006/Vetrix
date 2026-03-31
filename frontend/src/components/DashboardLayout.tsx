'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useWallet } from '../context/WalletContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { address, chainId, disconnect } = useWallet();

  return (
    <div className="bg-dot-grid" style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'var(--bg-black)',
      overflow: 'hidden',
    }}>
      {/* Persistent Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0, // Prevent content from pushing sidebar
      }}>
        <Header address={address} chainId={chainId} onDisconnect={disconnect} />
        
        <main style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
