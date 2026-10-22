// src/screens/Unlock.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Lock } from 'lucide-react';

export default function Unlock() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { checkStatus } = useWallet();

  const handleUnlock = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'UNLOCK', password });
      
      if (response?.error) throw new Error(response.error);
      
      await checkStatus();
      navigate('/dashboard');
    } catch (err: unknown) {
      // NOW WE WILL ACTUALLY SEE THE ERROR!
      console.error("Unlock Error:", err); 
      setError('Incorrect password or corrupted vault.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50">
      <div className="bg-blue-100 p-4 rounded-full mb-6">
        <Lock className="w-10 h-10 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
      <p className="text-gray-500 mb-8">Enter your password to unlock your wallet.</p>
      
      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-center"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
      />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button 
        onClick={handleUnlock}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700"
      >
        Unlock
      </button>
    </div>
  );
}