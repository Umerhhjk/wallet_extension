// src/background.ts
import { ethers } from 'ethers';
import { getVault } from './utils/vault';
import { decryptData } from './utils/crypto';

// --- THE SECURE ENCLAVE ---
// This lives in the isolated background thread. 
// The React UI cannot touch this memory.
let activeWallet: ethers.HDNodeWallet | null = null;

// Listen for messages from the React UI
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  
  if (request.type === 'PING') {
    // Check if wallet is unlocked without exposing the key
    sendResponse({ isUnlocked: !!activeWallet, address: activeWallet?.address || null });
    return false; 
  }

  if (request.type === 'LOCK') {
    activeWallet = null;
    sendResponse({ success: true });
    return false;
  }

  if (request.type === 'LOAD_MNEMONIC') {
    // Used during Create/Import flows to pass the phrase into the enclave
    activeWallet = ethers.Wallet.fromPhrase(request.mnemonic);
    sendResponse({ success: true, address: activeWallet.address });
    return false;
  }

  if (request.type === 'UNLOCK') {
    handleUnlock(request.password)
      .then(sendResponse)
      .catch((err) => {
        // Log the full error natively in the background worker!
        console.error("BACKGROUND UNLOCK ERROR:", err); 
        sendResponse({ error: err.message });
      });
    return true;
  }

  if (request.type === 'SEND_TX') {
    handleSendTx(request.to, request.amount)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

// --- Handlers ---

async function handleUnlock(password: string) {
  const vault = await getVault();
  if (!vault) throw new Error('No vault found in storage.');
  
  const mnemonic = await decryptData(vault.mnemonicEncrypted, password);
  activeWallet = ethers.Wallet.fromPhrase(mnemonic);
  
  return { success: true, address: activeWallet.address };
}

async function handleSendTx(to: string, amount: string) {
  if (!activeWallet) throw new Error('Wallet is locked or not initialized.');
  
  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  const connectedWallet = activeWallet.connect(provider);
  
  const tx = await connectedWallet.sendTransaction({
    to,
    value: ethers.parseEther(amount)
  });
  
  return { success: true, hash: tx.hash };
}