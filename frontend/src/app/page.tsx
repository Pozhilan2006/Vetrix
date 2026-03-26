'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWallet } from '../context/WalletContext';

export default function LandingPage() {
  const { connect, isConnected, isConnecting, error } = useWallet();
  const router = useRouter();

  const handleConnect = async () => {
    if (isConnected) {
      router.push('/chat');
      return;
    }
    await connect();
  };

  // Redirect to chat if already connected
  React.useEffect(() => {
    if (isConnected) {
      router.push('/chat');
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #0f1a3e 60%, #0a0a1a 100%)' }}>

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: '#8b5cf6', top: '10%', left: '15%' }}
        />
        <motion.div
          animate={{
            x: [0, -80, 120, 0],
            y: [0, 60, -40, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: '#e94560', bottom: '10%', right: '15%' }}
        />
        <motion.div
          animate={{
            x: [0, 50, -100, 0],
            y: [0, -100, 50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-72 h-72 rounded-full blur-3xl opacity-10"
          style={{ background: '#06b6d4', top: '50%', left: '50%' }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center max-w-2xl px-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-8"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)',
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.4)',
          }}
        >
          A
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-6xl font-black mb-4"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AURA V2
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-400 mb-2 font-light"
        >
          Autonomous AI Web3 Agent
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm text-gray-500 mb-10 max-w-md mx-auto leading-relaxed"
        >
          Type naturally. Transactions execute instantly. No MetaMask popups.
          The bot signs and broadcasts — you just talk.
        </motion.p>

        {/* Connect Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-10 py-4 rounded-xl text-white font-bold text-lg transition-all"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
          }}
        >
          {isConnecting ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Connecting...
            </span>
          ) : isConnected ? (
            'Enter Aura V2 →'
          ) : (
            '🦊 Connect MetaMask'
          )}
        </motion.button>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* Feature Cards — V2 Updated */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16"
        >
          {[
            { icon: '🧠', title: 'AI Intent Parser', desc: 'Gemini 2.0 Flash understands your natural language' },
            { icon: '🤖', title: 'Autonomous Agent', desc: 'Bot signs and broadcasts — no MetaMask popups' },
            { icon: '⚡', title: 'Instant Execution', desc: 'Transactions confirm on Sepolia in seconds' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(139, 92, 246, 0.3)' }}
              className="p-5 rounded-xl text-left transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-xs text-gray-600"
        >
          Sepolia Testnet • Autonomous Agent • Burner Wallet Only • Final Year Project
        </motion.p>
      </motion.div>
    </div>
  );
}
