'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  chainId: string | null;
  signer: ethers.JsonRpcSigner | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  signer: null,
  provider: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  error: null,
});

export const useWallet = () => useContext(WalletContext);

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum!);
      await browserProvider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
      await browserProvider.send('eth_requestAccounts', []);

      const walletSigner = await browserProvider.getSigner();
      const walletAddress = await walletSigner.getAddress();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(walletSigner);
      setAddress(walletAddress);
      setChainId(network.chainId.toString());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      console.error('Wallet connect error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setError(null);
  }, []);

  // Check if already connected on mount — runs only once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (typeof window === 'undefined' || !window.ethereum) return;

    const checkConnection = async () => {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum!);
        const accounts = await browserProvider.listAccounts();

        if (accounts.length > 0) {
          const walletSigner = await browserProvider.getSigner();
          const network = await browserProvider.getNetwork();

          setProvider(browserProvider);
          setSigner(walletSigner);
          setAddress(await walletSigner.getAddress());
          setChainId(network.chainId.toString());
        }
      } catch (err) {
        console.error('Auto-connect check error:', err);
      }
    };

    checkConnection();
  }, []);

  // Listen for MetaMask events
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = async (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        disconnect();
      } else {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum!);
          const walletSigner = await browserProvider.getSigner();
          setProvider(browserProvider);
          setSigner(walletSigner);
          setAddress(accs[0]);
        } catch (err) {
          console.error('Account change error:', err);
        }
      }
    };

    const handleChainChanged = async (_chainId: unknown) => {
      try {
        const id = _chainId as string;
        setChainId(parseInt(id, 16).toString());
        // Rebuild provider for new chain
        const browserProvider = new ethers.BrowserProvider(window.ethereum!);
        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          const walletSigner = await browserProvider.getSigner();
          setProvider(browserProvider);
          setSigner(walletSigner);
        }
      } catch (err) {
        console.error('Chain change error:', err);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        signer,
        provider,
        isConnected: !!address,
        isConnecting,
        connect,
        disconnect,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;
