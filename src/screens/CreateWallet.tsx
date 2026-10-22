// src/screens/CreateWallet.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMnemonic, encryptData } from '../utils/crypto';
import { saveVault } from '../utils/vault';
import { useWallet } from '../context/WalletContext';
import { ArrowLeft } from 'lucide-react';

export default function CreateWallet() {
  const [mnemonic] = useState(() => generateMnemonic()); 
  const [password, setPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { checkStatus } = useWallet();

  const handleCreate = async () => {
    if (!isSaved) return setError('Please confirm you saved your secret phrase.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    try {
      const encryptedMnemonic = await encryptData(mnemonic, password);
      await saveVault({ mnemonicEncrypted: encryptedMnemonic });
      
      // Send the raw mnemonic securely to the background worker
      const response = await chrome.runtime.sendMessage({ 
        type: 'LOAD_MNEMONIC', 
        mnemonic 
      });

      if (response?.error) throw new Error(response.error);

      // Refresh our UI context to pull the newly loaded address
      await checkStatus();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create wallet.');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 flex items-center border-b border-gray-200 bg-white">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-lg font-semibold text-gray-900">Create Wallet</h1>
      </header>
      
      <div className="p-6 flex-1 flex flex-col overflow-y-auto">
        <p className="text-sm text-gray-600 mb-4">
          Write down these 12 words in order and keep them safe. If you lose them, you lose your funds.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {mnemonic.split(' ').map((word, i) => (
            <div key={i} className="bg-white p-2 rounded border border-gray-200 text-center text-sm font-medium">
              <span className="text-gray-400 text-xs mr-1">{i + 1}.</span>{word}
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input type="checkbox" checked={isSaved} onChange={(e) => setIsSaved(e.target.checked)} className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-700">I have securely saved my secret phrase</span>
        </label>

        <hr className="mb-6 border-gray-200" />

        <input
          type="password"
          placeholder="Set a secure password"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button 
          onClick={handleCreate}
          className="w-full mt-auto bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700"
        >
          Encrypt & Create Vault
        </button>
      </div>
    </div>
  );
}