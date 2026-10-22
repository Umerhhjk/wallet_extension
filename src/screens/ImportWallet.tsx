// src/screens/ImportWallet.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptData, validateMnemonic } from '../utils/crypto';
import { saveVault } from '../utils/vault';
import { useWallet } from '../context/WalletContext';
import { ArrowLeft } from 'lucide-react';

export default function ImportWallet() {
  const [phrase, setPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { checkStatus } = useWallet();

  const handleImport = async () => {
    setError('');
    const cleanedPhrase = phrase.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!validateMnemonic(cleanedPhrase)) {
      return setError('Invalid Secret Recovery Phrase. Check your spelling.');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    try {
      const encryptedMnemonic = await encryptData(cleanedPhrase, password);
      await saveVault({ mnemonicEncrypted: encryptedMnemonic });
      
      // Send the raw mnemonic securely to the background worker
      const response = await chrome.runtime.sendMessage({ 
        type: 'LOAD_MNEMONIC', 
        mnemonic: cleanedPhrase 
      });

      if (response?.error) throw new Error(response.error);

      // Refresh our UI context
      await checkStatus();
      navigate('/dashboard');
    } catch {
      setError('Failed to import wallet.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 flex items-center border-b border-gray-200 bg-white">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-lg font-semibold text-gray-900">Import Wallet</h1>
      </header>
      
      <div className="p-6 flex-1 flex flex-col overflow-y-auto">
        <p className="text-sm text-gray-600 mb-4">
          Enter your 12-word Secret Recovery Phrase to restore your wallet.
        </p>

        <textarea
          placeholder="e.g. apple banana cherry..."
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
        />

        <hr className="mb-6 border-gray-200" />

        <input
          type="password"
          placeholder="Set a new secure password"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button 
          onClick={handleImport}
          className="w-full mt-auto bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700"
        >
          Import & Encrypt Vault
        </button>
      </div>
    </div>
  );
}