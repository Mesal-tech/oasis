// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  
  server: {
    host: true,
    port: 5173, 
    strictPort: true,
    open: false,
    cors: true,
    hmr: {
      overlay: true
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@games': path.resolve(__dirname, './src/games'),
      '@ui': path.resolve(__dirname, './src/ui'),
    }
  },

  optimizeDeps: {
    include: ['phaser']
  },

  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },

  clearScreen: false,
});