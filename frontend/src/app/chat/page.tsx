'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useWallet } from '../../context/WalletContext';
import ChatInterface from '../../components/ChatInterface';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/chat').replace('/api/chat', '');

interface Balance {
  asset: string;
  amount: string;
  isNative: boolean;
  contractAddress?: string;
}

export default function ChatPage() {
  const { address, chainId, isConnected, connect, disconnect } = useWallet();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch portfolio balances
  useEffect(() => {
    if (!address) {
      setBalances([]);
      return;
    }

    const fetchBalances = async () => {
      setBalancesLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/portfolio/${address}?chain=sepolia`);
        if (res.data.balances) {
          setBalances(res.data.balances);
        }
      } catch (error) {
        console.error('Balance fetch error:', error);
      } finally {
        setBalancesLoading(false);
      }
    };

    fetchBalances();
    // Refresh every 30s
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [address]);

  const getNetworkName = (id: string | null) => {
    const names: Record<string, string> = {
      '11155111': 'Sepolia',
      '1': 'Ethereum',
      '137': 'Polygon',
      '42161': 'Arbitrum',
    };
    return id ? names[id] || `Chain ${id}` : 'Unknown';
  };

  return (
    <div className="h-screen flex" style={{ background: '#0a0a1a' }}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="w-72 flex-shrink-0 flex flex-col border-r border-white/5 h-screen"
        style={{ background: 'linear-gradient(180deg, #0f0f23 0%, #0a0a1a 100%)' }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
              A
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Aura V2</h1>
              <p className="text-xs text-gray-500">Autonomous Agent</p>
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        {isConnected && (
          <div className="p-4 border-b border-white/5">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <p className="text-xs font-semibold text-purple-400 mb-1">Connected Wallet</p>
              <p className="text-xs font-mono text-gray-300 truncate">{address}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {getNetworkName(chainId)}
                </span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>
            <button
              onClick={disconnect}
              className="w-full mt-2 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Portfolio */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Portfolio</h3>
          {balancesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
              ))}
            </div>
          ) : balances.length > 0 ? (
            <div className="space-y-2">
              {balances.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: b.isNative
                          ? 'linear-gradient(135deg, #627eea 0%, #4c5bd4 100%)'
                          : 'linear-gradient(135deg, #26a17b 0%, #1a7a5c 100%)'
                      }}>
                      {b.asset.slice(0, 2)}
                    </div>
                    <span className="text-sm font-semibold text-white">{b.asset}</span>
                  </div>
                  <span className="text-sm font-mono text-gray-300">{b.amount}</span>
                </motion.div>
              ))}
            </div>
          ) : isConnected ? (
            <p className="text-xs text-gray-500 text-center py-4">No balances found</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-xs text-gray-500 text-center mb-3">Connect wallet to view portfolio</p>
              <button
                onClick={connect}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all w-full"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                }}
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-gray-600 text-center">Sepolia Testnet</p>
          <p className="text-xs text-gray-600 text-center">V2 — Autonomous Agent</p>
        </div>
      </motion.aside>

      {/* Toggle Sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-r-lg text-gray-400 hover:text-white transition-all"
        style={{ left: sidebarOpen ? '18rem' : 0, background: 'rgba(255,255,255,0.05)' }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatInterface />
      </main>
    </div>
  );
}
