// src/App.tsx
import { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { hasVault } from './utils/vault';
import { WalletProvider } from './context/WalletContext';

import Welcome from './screens/Welcome';
import CreateWallet from './screens/CreateWallet';
import Unlock from './screens/Unlock';
import Dashboard from './screens/Dashboard';
import ImportWallet from './screens/ImportWallet';
import Send from './screens/Send';

export default function App() {
  const [vaultExists, setVaultExists] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if a vault exists in storage on load
    hasVault().then(exists => setVaultExists(exists));
  }, []);

  // Show nothing while checking storage
  if (vaultExists === null) return null; 

  return (
    <div className="w-[360px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-gray-200">
      <WalletProvider>
        <MemoryRouter initialEntries={[vaultExists ? '/unlock' : '/']}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/create" element={<CreateWallet />} />
            <Route path="/unlock" element={<Unlock />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/import" element={<ImportWallet />} />
            <Route path="/send" element={<Send />} />
          </Routes>
        </MemoryRouter>
      </WalletProvider>
    </div>
  );
}