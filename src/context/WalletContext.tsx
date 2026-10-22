// src/context/WalletContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface WalletContextType {
  isUnlocked: boolean;
  address: string | null;
  checkStatus: () => Promise<void>;
  lockWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Helper to check if we are running in the Chrome Extension environment
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!isExtension) return;
    try {
      const response = await chrome.runtime.sendMessage({ type: 'PING' });
      if (response) {
        setIsUnlocked(response.isUnlocked);
        setAddress(response.address);
      }
    } catch (err) {
      console.log('Not connected to background worker yet.', err);
    }
  };

  const lockWallet = async () => {
    if (!isExtension) return;
    await chrome.runtime.sendMessage({ type: 'LOCK' });
    setIsUnlocked(false);
    setAddress(null);
  };

  // Check status on initial load
  // Check status on initial load
  useEffect(() => {
    const timeout = setTimeout(() => {
      checkStatus();
    }, 0);
    
    return () => clearTimeout(timeout);
  }, []); // Leaving dependency array empty as checkStatus does not depend on changing variables

  return (
    <WalletContext.Provider value={{ isUnlocked, address, checkStatus, lockWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
}