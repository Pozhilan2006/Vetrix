'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';
import TransactionCard from './TransactionCard';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: any;
}

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm Nexus, your AI-powered assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { address, executeIntent } = useWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await axios.post('http://localhost:3001/api/chat', {
        message: input,
        userAddress: address
      });
      
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: resp.data.message, 
        intent: resp.data.intent 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Connection error. Please check your network and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fintech-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-depth)',
      border: '1px solid var(--border-neutral)',
      overflow: 'hidden',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: 'var(--s-16) var(--s-24)',
        borderBottom: '1px solid var(--border-neutral)',
        background: 'rgba(255,255,255,0.01)',
        backdropFilter: 'blur(8px)',
      }}>
        <h3 className="text-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AI Assistant</h3>
      </div>

      {/* Messages Stream: Fixed height with auto-scroll */}
      <div 
        className="scrollbar-hidden"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--s-24)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--s-24)',
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 'var(--s-4)',
          }}>
            {/* Label */}
            <span className="text-label" style={{ 
              fontSize: '8px', 
              opacity: 0.4, 
              textAlign: msg.role === 'user' ? 'right' : 'left',
              width: '100%',
              padding: msg.role === 'user' ? '0 var(--s-8) 0 0' : '0 0 0 var(--s-8)'
            }}>
              {msg.role === 'user' ? 'IDENTITY' : 'NEXUS'}
            </span>

            {/* Bubble */}
            <div style={{
              maxWidth: '85%',
              padding: 'var(--s-12) var(--s-16)',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'var(--bg-surface)' : 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-neutral)',
              color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: 1.5,
              wordBreak: 'break-word',
            }}>
              {msg.content}
            </div>

            {/* Intent Card */}
            {msg.intent && msg.intent.action !== 'none' && (
              <div style={{ width: '100%', marginTop: 'var(--s-8)' }}>
                <TransactionCard
                  intent={msg.intent}
                  onConfirm={() => executeIntent(msg.intent)}
                  onCancel={() => setMessages(prev => [...prev, { role: 'system', content: 'Operation cancelled.' }])}
                  isExecuting={false}
                />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: '4px', padding: '4px 8px' }}>
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>

      {/* Inline Suggestions (Part of Part 6 Fix) */}
      <div style={{
        padding: '0 var(--s-24) var(--s-12)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--s-8)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontWeight: 600,
      }}>
        {['Send 0.01 ETH', 'Check balance', 'Swap ETH'].map((suggestion, idx, arr) => (
          <React.Fragment key={suggestion}>
            <span 
              onClick={() => setInput(suggestion)}
              style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-green)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {suggestion}
            </span>
            {idx < arr.length - 1 && <span>•</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Input Area: Fixed bottom, border-top only */}
      <div style={{
        padding: 'var(--s-16) var(--s-24)',
        borderTop: '1px solid var(--border-neutral)',
        background: 'var(--bg-black)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s-12)',
          background: '#0a0a0a',
          padding: '4px 8px 4px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-neutral)',
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Nexus..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '8px 0',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: input.trim() ? 'var(--accent-green)' : 'transparent',
              border: 'none',
              color: '#000',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              opacity: input.trim() ? 1 : 0,
              pointerEvents: input.trim() ? 'auto' : 'none',
            }}
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
