'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntentData {
  action: string;
  chain: string | null;
  asset: string | null;
  amount: string | null;
  to_address: string | null;
  tokenAddress: string | null;
  tokenDecimals?: number;
  gasEstimate: string | null;
  gasPriceGwei: string | null;
  gasLimit?: string;
  confidence: number;
  risk_flags: string[];
  human_readable_summary?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  intent: IntentData | null;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  intent,
  onConfirm,
  onCancel,
  isExecuting,
}) => {
  if (!intent) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'linear-gradient(135deg, #e94560 0%, #533483 100%)' }}>
                  ⚡
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Confirm Transaction</h2>
                  <p className="text-xs text-gray-400">Review details before signing</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Action */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</span>
                <span className="text-sm font-bold text-white capitalize">{intent.action}</span>
              </div>

              {/* Asset & Amount */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-bold text-gray-400 mb-1">SENDING</p>
                <p className="text-2xl font-bold text-white">
                  {intent.amount} <span className="text-purple-400">{intent.asset}</span>
                </p>
              </div>

              {/* Recipient */}
              {intent.to_address && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs font-bold text-gray-400 mb-1">TO</p>
                  <p className="text-sm text-white font-mono break-all">{intent.to_address}</p>
                </div>
              )}

              {/* Chain */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Network</span>
                <span className="text-sm text-white capitalize">{intent.chain || 'Sepolia'}</span>
              </div>

              {/* Gas Estimate */}
              {intent.gasEstimate && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>ESTIMATED GAS FEE</p>
                  <p className="text-sm text-white font-mono">{intent.gasEstimate} ETH</p>
                  {intent.gasPriceGwei && (
                    <p className="text-xs text-gray-400 mt-1">{intent.gasPriceGwei}</p>
                  )}
                </div>
              )}

              {/* Risk Flags */}
              {intent.risk_flags && intent.risk_flags.length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: '#ef4444' }}>⚠ RISK WARNINGS</p>
                  {intent.risk_flags.map((flag, i) => (
                    <p key={i} className="text-xs mb-1" style={{ color: '#fca5a5' }}>• {flag}</p>
                  ))}
                </div>
              )}

              {/* Confidence */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Confidence</span>
                <span className={`text-sm font-bold ${
                  intent.confidence >= 0.9 ? 'text-green-400' :
                  intent.confidence >= 0.7 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {Math.round(intent.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 pt-2 flex gap-3">
              <button
                onClick={onCancel}
                disabled={isExecuting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-gray-300 transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isExecuting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                style={{
                  background: isExecuting
                    ? 'rgba(139, 92, 246, 0.5)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  boxShadow: isExecuting ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.4)',
                }}
              >
                {isExecuting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing...
                  </span>
                ) : (
                  'Confirm & Sign'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;
