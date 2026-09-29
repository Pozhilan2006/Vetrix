'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { useWallet } from '@/context/WalletContext';
import ChatPanel from '@/components/ChatPanel';
import TokenList from '@/components/TokenList';
import TransactionHistory from '@/components/TransactionHistory';
import ActionModal from '@/components/ActionModal';

const NETWORK_NAMES: Record<string, string> = { '11155111': 'Sepolia', '1': 'Ethereum' };

export default function WalletHub() {
  const { balances, loading, address, disconnect, connect, isConnected, chainId, prices, history } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'send' | 'swap' | 'receive'>('send');
  const [copied, setCopied] = useState(false);

  const ethBalance = balances.find(balance => balance.isNative);
  const ethAmount = Number.parseFloat(ethBalance?.amount ?? '0');
  const totalUsd = balances.reduce((total, balance) => {
    const price = prices[balance.asset] ?? (['USDC', 'USDT', 'DAI'].includes(balance.asset) ? 1 : 0);
    return total + Number.parseFloat(balance.amount) * price;
  }, 0);
  const networkName = chainId ? (NETWORK_NAMES[chainId] ?? 'Unknown') : 'Disconnected';
  const hasAssets = balances.some(balance => Number.parseFloat(balance.amount) > 0);

  const openModal = (tab: 'send' | 'swap' | 'receive') => {
    setModalTab(tab);
    setModalOpen(true);
  };

  const copyAddress = async () => {
    if (!address || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

      <header className={styles.header}>
        <a className={styles.brand} href="/chat" aria-label="Vetrix home">
          <span className={styles.brandMark}>N</span>
          <span className={styles.brandName}>Vetrix</span>
          <span className={styles.version}>v3.0</span>
        </a>

        <div className={styles.headerActions}>
          <div className={styles.networkPill}>
            <span className={`${styles.statusDot} ${isConnected ? styles.online : ''}`} />
            {isConnected ? `${networkName} Network` : 'Disconnected Network'}
          </div>
          {address && (
            <button className={styles.addressPill} onClick={copyAddress} title="Copy wallet address">
              {address.slice(0, 6)}…{address.slice(-4)}
              <span aria-live="polite">{copied ? 'Copied' : '▢'}</span>
            </button>
          )}
          {isConnected ? (
            <button className={styles.disconnectButton} onClick={disconnect}>Disconnect</button>
          ) : (
            <button className={styles.connectButton} onClick={connect}>Connect Wallet</button>
          )}
        </div>
      </header>

      <div className={styles.dashboard}>
        <section className={styles.topGrid} aria-label="Wallet overview">
          <article className={`${styles.card} ${styles.portfolioCard}`}>
            <div className={styles.cardHeading}>
              <h1 className={styles.cardLabel}>Portfolio Balance</h1>
              <button className={styles.moreButton} aria-label="Portfolio options">···</button>
            </div>
            <div className={styles.portfolioValue}>
              <div>
                {loading && balances.length === 0 ? <div className={styles.balanceSkeleton} /> : <div className={styles.ethBalance}>{ethAmount.toFixed(4)} <span>ETH</span></div>}
                <p className={styles.usdBalance}>≈ ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
              </div>
              <div className={styles.ethCoin} aria-label="Ethereum">◆<span>♦</span></div>
            </div>
            <div className={styles.chart} aria-label="Decorative portfolio trend">
              <svg viewBox="0 0 460 125" preserveAspectRatio="none" role="img" aria-hidden="true">
                <defs><linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#12dc78" stopOpacity=".22"/><stop offset="1" stopColor="#12dc78" stopOpacity="0"/></linearGradient></defs>
                <path d="M0 104 C35 86 45 69 78 76 S121 92 153 72 194 45 221 61 262 77 291 50 331 13 363 32 409 52 430 28 448 12 460 8 V125 H0Z" fill="url(#portfolioFill)" />
                <path d="M0 104 C35 86 45 69 78 76 S121 92 153 72 194 45 221 61 262 77 291 50 331 13 363 32 409 52 430 28 448 12 460 8" fill="none" stroke="#16d979" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className={styles.lastActivity}>
              <span>Last activity</span>
              <strong>{history[0] ? `${history[0].category === 'external' ? 'Sent' : 'Received'} ${Number.parseFloat(history[0].value).toFixed(4)} ${history[0].asset}` : 'No recent activity'}</strong>
            </div>
          </article>

          <article className={`${styles.card} ${styles.actionsCard}`}>
            <h2 className={styles.cardLabel}>Quick Actions</h2>
            <div className={styles.actionList}>
              <button className={styles.actionButton} onClick={() => openModal('send')}>
                <span className={`${styles.actionIcon} ${styles.sendIcon}`}>↗</span><span className={styles.actionCopy}><strong>Send</strong><small>Transfer to any address</small></span><span className={styles.actionArrow}>›</span>
              </button>
              <button className={styles.actionButton} onClick={() => openModal('swap')}>
                <span className={`${styles.actionIcon} ${styles.swapIcon}`}>⇄</span><span className={styles.actionCopy}><strong>Swap</strong><small>Exchange tokens</small></span><span className={styles.actionArrow}>›</span>
              </button>
              <button className={styles.actionButton} onClick={() => openModal('receive')}>
                <span className={`${styles.actionIcon} ${styles.receiveIcon}`}>⇩</span><span className={styles.actionCopy}><strong>Receive</strong><small>Show your QR code</small></span><span className={styles.actionArrow}>›</span>
              </button>
            </div>
          </article>

          <article className={`${styles.card} ${styles.assetsCard}`}>
            <div className={styles.cardHeading}><h2 className={styles.cardLabel}>Assets</h2><button className={styles.moreButton} aria-label="Asset options">···</button></div>
            {hasAssets || loading ? (
              <div className={styles.tokenList}><TokenList tokens={balances} loading={loading} /></div>
            ) : (
              <div className={styles.emptyAssets}>
                <div className={styles.walletIllustration} aria-hidden="true"><span /><i /></div>
                <h3>No assets found</h3>
                <p>Receive funds to activate your wallet</p>
                <button onClick={() => openModal('receive')}>Receive Funds</button>
              </div>
            )}
          </article>
        </section>

        <section className={styles.bottomGrid} aria-label="Assistant and activity">
          <article className={`${styles.card} ${styles.assistantCard}`}>
            <div className={styles.assistantHeading}>
              <div className={styles.robotIcon}>✦</div>
              <div className={styles.assistantTitle}><h2>Vetrix AI Agent</h2><p><span className={`${styles.statusDot} ${isConnected ? styles.online : ''}`} />{isConnected ? 'Active' : 'Standby'}</p></div>
              <span className={styles.assistantSparkle}>✦</span>
              <button className={styles.moreButton} aria-label="Assistant options">···</button>
            </div>
            <div className={styles.chatPanel}><ChatPanel ethAmount={ethAmount} lastTx={history[0] ?? null} /></div>
          </article>

          <article className={`${styles.card} ${styles.activityCard}`}>
            <div className={styles.cardHeading}><h2 className={styles.cardLabel}>Recent Activity</h2><button className={styles.moreButton} aria-label="Activity options">···</button></div>
            {history.length > 0 || loading ? (
              <div className={styles.historyList}><TransactionHistory /></div>
            ) : (
              <div className={styles.emptyActivity}>
                <div className={styles.documentIcon} aria-hidden="true"><span /><i /><i /><i /></div>
                <h3>No recent activity found.</h3>
                <p>Your transactions will appear here<br />once you start using your wallet.</p>
              </div>
            )}
          </article>
        </section>
      </div>

      <ActionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialTab={modalTab} />
    </main>
  );
}
