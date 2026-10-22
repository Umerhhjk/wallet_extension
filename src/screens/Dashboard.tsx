// src/screens/Dashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { LogOut, RefreshCw, Copy, Check } from 'lucide-react';

const SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

export default function Dashboard() {
  const { isUnlocked, address, lockWallet } = useWallet();
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState<string>('0.00');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const fetchBalance = useCallback(async (showSpinner = false) => {
    if (!isUnlocked || !address) return;
    
    if (showSpinner) setIsRefreshing(true);
    
    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Failed to fetch balance from RPC:', error);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, [isUnlocked, address]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchBalance(false), 0);
    const interval = setInterval(() => fetchBalance(false), 15000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchBalance]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await lockWallet();
    navigate('/unlock');
  };

  if (!isUnlocked || !address) {
    navigate('/unlock');
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Sepolia Testnet</span>
        </div>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500" title="Lock Wallet">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="p-6 flex-1 flex flex-col items-center pt-8">
        <button 
          onClick={handleCopyAddress}
          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors mb-8"
        >
          {formatAddress(address || '')}
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </button>

        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-gray-500 text-sm font-medium">Total Balance</h2>
          {/* Manually trigger the spinner by passing true */}
          <button onClick={() => fetchBalance(true)} disabled={isRefreshing} className="text-gray-400 hover:text-gray-800 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-4xl font-bold text-gray-900 mb-8">
          {balance} <span className="text-xl text-gray-500">ETH</span>
        </p>
        
        <div className="flex gap-4 w-full mt-auto">
          <button 
            onClick={() => navigate('/send')} // <-- Add this onClick handler
            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
          <button className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-colors">
            Receive
          </button>
        </div>
      </div>
    </div>
  );
}