// src/screens/Send.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { ArrowLeft, Send as SendIcon, ExternalLink } from 'lucide-react';

export default function Send() {
  const { isUnlocked } = useWallet();
  const navigate = useNavigate();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleSend = async () => {
    setError('');
    
    if (!isUnlocked) return setError('Wallet not found. Please log in again.');
    if (!ethers.isAddress(recipient)) return setError('Invalid recipient address.');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Invalid amount.');

    setIsSending(true);

    try {
      const response = await chrome.runtime.sendMessage({ 
        type: 'SEND_TX', 
        to: recipient, 
        amount 
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      setTxHash(response.hash);
      
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Transaction failed.');
      } else {
        setError('Transaction failed.');
      }
    } finally {
      setIsSending(false);
    }
  };

  if (txHash) {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <SendIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Sent!</h2>
        <p className="text-gray-500 mb-8">Your testnet ETH is on the way.</p>
        
        <a 
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors mb-4"
        >
          View on Etherscan <ExternalLink className="w-4 h-4" />
        </a>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 flex items-center border-b border-gray-200 bg-white">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-lg font-semibold text-gray-900">Send ETH</h1>
      </header>

      <div className="p-6 flex-1 flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
        <input
          type="text"
          placeholder="0x..."
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />

        <label className="text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
        <div className="relative mb-6">
          <input
            type="number"
            step="0.0001"
            placeholder="0.00"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="absolute right-4 top-3.5 text-gray-500 font-medium">ETH</span>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button 
          onClick={handleSend}
          disabled={isSending}
          className="w-full mt-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          {isSending ? (
            <span className="animate-pulse">Broadcasting...</span>
          ) : (
            <>Send Transaction <SendIcon className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}