// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        background: './src/background.ts' // We will create this next
      },
      output: {
        entryFileNames: (assetInfo) => {
          // Force the background script to compile exactly as 'background.js'
          return assetInfo.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js';
        }
      }
    }
  }
});