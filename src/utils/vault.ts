// src/utils/vault.ts
import type { EncryptedData } from './crypto';

const VAULT_KEY = 'secure_wallet_vault';

export interface WalletVault {
  mnemonicEncrypted: EncryptedData;
}

// Helper to check if we are in the extension environment
const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export async function saveVault(vault: WalletVault): Promise<void> {
  if (isExtension) {
    await chrome.storage.local.set({ [VAULT_KEY]: vault });
  } else {
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
  }
}

export async function getVault(): Promise<WalletVault | null> {
  if (isExtension) {
    const data = await chrome.storage.local.get(VAULT_KEY);
    // Explicitly cast the returned data to WalletVault
    return (data[VAULT_KEY] as WalletVault) || null;
  } else {
    const data = localStorage.getItem(VAULT_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as WalletVault;
    } catch (error) {
      console.error('Failed to parse vault data', error);
      return null;
    }
  }
}

export async function clearVault(): Promise<void> {
  if (isExtension) {
    await chrome.storage.local.remove(VAULT_KEY);
  } else {
    localStorage.removeItem(VAULT_KEY);
  }
}

export async function hasVault(): Promise<boolean> {
  const vault = await getVault();
  return vault !== null;
}