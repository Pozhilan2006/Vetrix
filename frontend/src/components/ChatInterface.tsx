'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  intentData?: IntentData | null;
  txHash?: string;
  explorer?: string;
  status?: string;
}

interface IntentData {
  action: string;
  chain: string | null;
  asset: string | null;
  amount: string | null;
  to_address: string | null;
  tokenAddress?: string | null;
  tokenDecimals?: number;
  gasEstimate?: string | null;
  gasPriceGwei?: string | null;
  gasLimit?: string;
  confidence: number;
  risk_flags: string[];
  human_readable_summary?: string;
  balances?: Array<{ asset: string; amount: string; isNative: boolean }>;
  missing_field?: string;
  txHash?: string;
  status?: string;
  statusSource?: string;
  safetyScore?: number;
  stage?: string;
  needs_confirmation?: boolean;
}

const ChatInterface: React.FC = () => {
  const { address, isConnected } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm Aura V2, your autonomous AI Web3 agent. I can send tokens, check balances, and explain blockchain concepts. Just tell me what you need — no MetaMask popups, I handle everything! 🤖",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadingStages = [
    "🧠 Analyzing Intent...",
    "👤 Resolving Context...",
    "🛡️ Verifying Safety...",
    "⛓️ Executing Transaction..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage(prev => (prev < 3 ? prev + 1 : prev));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── V2.4: LIVE TRANSACTION LIFECYCLE MONITOR ──
  const { provider } = useWallet();
  useEffect(() => {
    const pendingMsgs = messages.filter(m => m.role === 'assistant' && m.status === 'pending' && m.txHash);
    
    pendingMsgs.forEach(async (msg) => {
      if (!msg.txHash || !provider) return;
      
      try {
        console.log(`[LIFECYCLE] Watching transaction: ${msg.txHash}`);
        const receipt = await provider.waitForTransaction(msg.txHash);
        
        if (receipt) {
          console.log(`[LIFECYCLE] Confirmed! Update status for ${msg.txHash}`);
          setMessages(prev => prev.map(m => 
            m.id === msg.id ? { ...m, status: 'success' } : m
          ));
        }
      } catch (err) {
        console.error(`[LIFECYCLE] Confirmation failed for ${msg.txHash}:`, err);
      }
    });
  }, [messages, provider]);

  const addMessage = useCallback((role: 'user' | 'assistant' | 'system', content: string, intentData?: IntentData | null, txHash?: string, explorer?: string, status?: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      role,
      content,
      timestamp: Date.now(),
      intentData,
      txHash,
      explorer,
      status,
    }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await axios.post(API_BASE_URL, {
        message: userMessage,
        session_id: sessionId,
        wallet_address: address,
      });

      const data = response.data;

      // ── V2: Handle 'done' response — transaction already executed on backend ──
      if (data.next_step === 'done') {
        // V2.4: Instant UI Feedback - Message is added as 'pending'
        addMessage('assistant', data.message, data.data || null, data.txHash, data.explorer, 'pending');

        if (data.txHash) {
          setLastTxHash(data.txHash);
        }
        
        // V2.4: Removing the redundant 'system' message with Etherscan link
        // as the hash is already in the assistant message and we now update its status live.
      }
      // ── V2.3: Handle Ask User with Confirmation Flag ──
      else if (data.next_step === 'ask_user' && data.data?.needs_confirmation) {
        addMessage('assistant', data.message, data.data);
      }
      // ── Handle error response ──
      else if (data.next_step === 'error') {
        addMessage('assistant', `❌ ${data.message}`);
      }
      // ── Handle ask_user (gap filling, balance response, etc.) ──
      else {
        addMessage('assistant', data.message, data.data || null);
      }
    } catch (error) {
      console.error('Chat error:', error);
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        addMessage('system', '❌ Unable to connect to the backend. Please ensure the server is running.');
      } else {
        addMessage('system', '❌ Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #111128 100%)' }}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className={`flex w-full mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 relative overflow-hidden shadow-2xl transition-all duration-500 ${
                  msg.role === 'user'
                    ? 'text-white'
                    : msg.role === 'system'
                    ? 'text-yellow-200'
                    : 'text-gray-100'
                }`}
                style={{
                  background:
                    msg.role === 'user'
                      ? 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)'
                      : msg.role === 'system'
                      ? 'rgba(245, 158, 11, 0.15)'
                      : msg.txHash && msg.status === 'pending'
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
                      : msg.txHash
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                      : 'rgba(255,255,255,0.06)',
                  border: msg.role === 'system'
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : msg.txHash && msg.status === 'pending'
                    ? '1px solid rgba(59, 130, 246, 0.3)'
                    : msg.txHash
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* V2.2: Safety Approved Glow Effect */}
                {msg.intentData?.safetyScore === 100 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.1, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 pointer-events-none bg-green-500/20"
                  />
                )}

                <p className="text-sm whitespace-pre-wrap leading-relaxed relative z-10">{msg.content}</p>

                {/* V2: Transaction Hash Badge */}
                {msg.txHash && (
                  <div className="mt-3 pt-2 border-t border-white/10 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.status === 'pending' ? (
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-tight">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          ⏳ {msg.intentData?.stage === 'mempool' ? 'In Mempool (Broadcasted)' : 'Broadcasting to Sepolia'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-tight">✅ Confirmed On-Chain</span>
                      )}
                    </div>
                    <a
                      href={msg.explorer || `https://sepolia.etherscan.io/tx/${msg.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono text-blue-300 hover:text-blue-200 hover:underline break-all"
                    >
                      {msg.txHash}
                    </a>
                  </div>
                )}

                {/* V2.2: Intelligence Badges */}
                {msg.intentData && msg.role === 'assistant' && (
                  <div className="flex flex-wrap gap-2 mt-3 relative z-10">
                    {msg.intentData.statusSource && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-[9px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                        {msg.intentData.statusSource}
                      </span>
                    )}
                    {msg.intentData.safetyScore !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest ${
                        msg.intentData.safetyScore >= 90 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        🛡️ Safety: {msg.intentData.safetyScore}%
                      </span>
                    )}
                  </div>
                )}

                {/* V2.3: Confirmation Buttons (Visual Only) */}
                {msg.intentData?.needs_confirmation && msg.role === 'assistant' && (
                  <div className="mt-4 flex gap-2 relative z-10">
                    <button 
                      onClick={() => setInput('Yes')}
                      className="px-3 py-1.5 rounded-md bg-green-500/20 text-[10px] font-bold text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all uppercase"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => setInput('No')}
                      className="px-3 py-1.5 rounded-md bg-red-500/20 text-[10px] font-bold text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Balance Display */}
                {msg.intentData?.balances && msg.intentData.balances.length > 0 && (
                  <div className="mt-4 space-y-1.5 relative z-10">
                    {msg.intentData.balances.map((b, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-xs font-bold text-purple-300">{b.asset}</span>
                        <span className="text-xs font-mono text-white">{b.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="rounded-2xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '200ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
                <span className="text-[11px] font-medium text-purple-300 tracking-tight transition-all duration-300">
                  {loadingStages[loadingStage]}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Last TX Hash Display */}
      {lastTxHash && (
        <div className="mx-4 mb-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <span className="text-green-400 font-semibold">Last TX: </span>
          <a href={`https://sepolia.etherscan.io/tx/${lastTxHash}`} target="_blank" rel="noreferrer" className="text-green-300 font-mono hover:underline break-all">
            {lastTxHash}
          </a>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? 'Type your message... (e.g. "Send 0.01 ETH to 0x...")' : 'Connect your wallet to start...'}
            disabled={!isConnected || isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none px-3 py-2 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !input.trim() || isLoading}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-30"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
            }}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-gray-500 mt-2 text-center">Connect your MetaMask wallet to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
