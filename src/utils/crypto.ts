// src/utils/crypto.ts
import { ethers } from 'ethers';

// --- Mnemonic Utilities ---

/**
 * Generates a standard 12-word BIP-39 mnemonic.
 */
export function generateMnemonic(): string {
  const wallet = ethers.Wallet.createRandom();
  if (!wallet.mnemonic) throw new Error('Failed to generate mnemonic');
  return wallet.mnemonic.phrase;
}

/**
 * Validates a given mnemonic phrase.
 */
export function validateMnemonic(phrase: string): boolean {
  return ethers.Mnemonic.isValidMnemonic(phrase);
}

// --- Web Crypto API Utilities ---

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const PBKDF2_ITERATIONS = 600000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

export interface EncryptedData {
  salt: string; // Base64
  iv: string;   // Base64
  data: string; // Base64
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Helper to safely convert Uint8Array to Base64
 */
function uint8ArrayToBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis.btoa(binary);
}

/**
 * Helper to safely convert Base64 back to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const binaryString = globalThis.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM encryption key from a user password using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return globalThis.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string (like a mnemonic) using a password.
 */
export async function encryptData(plaintext: string, password: string): Promise<EncryptedData> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const key = await deriveKey(password, salt);

  const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    key,
    encoder.encode(plaintext)
  );

  return {
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
    data: uint8ArrayToBase64(new Uint8Array(encryptedBuffer)),
  };
}

/**
 * Decrypts data back to plaintext using the password.
 */
export async function decryptData(encryptedPayload: EncryptedData, password: string): Promise<string> {
  const salt = base64ToUint8Array(encryptedPayload.salt);
  const iv = base64ToUint8Array(encryptedPayload.iv);
  const encryptedData = base64ToUint8Array(encryptedPayload.data);

  const key = await deriveKey(password, salt);

  const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    key,
    encryptedData
  );

  return decoder.decode(decryptedBuffer);
}