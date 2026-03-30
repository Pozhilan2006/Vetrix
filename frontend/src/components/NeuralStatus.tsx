'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface SystemStats {
  botBalance: string;
  network: string;
  aiConfidence: number;
  status: 'online' | 'optimizing' | 'offline';
}

const NeuralStatus: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    botBalance: '0.00',
    network: 'Sepolia',
    aiConfidence: 0.98,
    status: 'online',
  });

  // Mocked for demo — in real app, we'd fetch this from backend/api/stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        aiConfidence: 0.95 + Math.random() * 0.05,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden md:flex flex-col gap-4 p-4 rounded-2xl w-64 h-fit fixed right-6 top-24 z-10"
      style={{ 
        background: 'rgba(17, 17, 40, 0.6)', 
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">System Status</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500 uppercase">{stats.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Core IQ */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs text-gray-400">AI Confidence</span>
            <span className="text-xs font-mono text-purple-400">{Math.round(stats.aiConfidence * 100)}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: `${stats.aiConfidence * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Network Info */}
        <div className="flex justify-between py-2 border-y border-white/5">
          <span className="text-xs text-gray-400">Network</span>
          <span className="text-xs font-semibold text-blue-400">{stats.network}</span>
        </div>

        {/* Neural Heat */}
        <div className="p-3 rounded-lg bg-white/5 space-y-2">
           <span className="text-[10px] text-gray-500 uppercase block">Intelligence Layer</span>
           <div className="flex flex-wrap gap-2">
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-[9px] text-purple-300 border border-purple-500/30">Decision Engine 2.2</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[9px] text-blue-300 border border-blue-500/30">Context Search</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NeuralStatus;
