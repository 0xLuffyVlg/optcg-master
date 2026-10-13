import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    https: true,
    proxy: {
      '/bandai-img': {
        target: 'https://en.onepiece-cardgame.com/images/cardlist/card',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bandai-img/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      '/bandai-product-img': {
        target: 'https://en.onepiece-cardgame.com/images/products',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bandai-product-img/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      '/egman-img': {
        target: 'https://img.egmanevents.com/optcg',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/egman-img/, '')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('jspdf') || id.includes('html-to-image') || id.includes('html2canvas')) return 'vendor-export';
            if (id.includes('tesseract.js')) return 'vendor-ocr';
            return 'vendor-libs';
          }
          if (id.includes('tournaments_initial.json') || id.includes('tournamentProvider')) return 'data-tournaments';
          if (id.includes('optcg_complete_database.json')) return 'data-complete-database';
          if (id.includes('card_links.json')) return 'data-card-links';
          if (id.includes('metaDecksData.json')) return 'data-meta-decks';
          if (id.includes('cards.json')) return 'data-cards';
          if (id.includes('variants.json')) return 'data-variants';
        }
      }
    }
  }
});
