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
  explorer?: string;
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
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((role: 'user' | 'assistant' | 'system', content: string, intentData?: IntentData | null, txHash?: string, explorer?: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      role,
      content,
      timestamp: Date.now(),
      intentData,
      txHash,
      explorer,
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
        addMessage('assistant', data.message, data.data || null, data.txHash, data.explorer);

        if (data.txHash) {
          setLastTxHash(data.txHash);
        }

        // Show Etherscan link as a separate clickable message
        if (data.explorer) {
          addMessage('system', `🔗 View on Etherscan: ${data.explorer}`);
        }
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
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
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
                      : msg.txHash
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)'
                      : 'rgba(255,255,255,0.06)',
                  border: msg.role === 'system'
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : msg.txHash
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {/* V2: Transaction Hash Badge */}
                {msg.txHash && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-green-400">✅ TX CONFIRMED</span>
                    </div>
                    <a
                      href={msg.explorer || `https://sepolia.etherscan.io/tx/${msg.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-green-300 hover:text-green-200 hover:underline break-all"
                    >
                      {msg.txHash}
                    </a>
                  </div>
                )}

                {/* Confidence Score */}
                {msg.intentData?.confidence && msg.intentData.confidence > 0 && msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                    <span className="text-xs text-gray-500">AI Confidence:</span>
                    <span className={`text-xs font-bold ${
                      msg.intentData.confidence >= 0.9 ? 'text-green-400' :
                      msg.intentData.confidence >= 0.7 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {Math.round(msg.intentData.confidence * 100)}%
                    </span>
                  </div>
                )}

                {/* Balance Display */}
                {msg.intentData?.balances && msg.intentData.balances.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {msg.intentData.balances.map((b, i) => (
                      <div key={i} className="flex items-center justify-between py-1 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <span className="text-xs font-semibold text-purple-300">{b.asset}</span>
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
            <div className="rounded-2xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500 ml-2">Processing...</span>
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
