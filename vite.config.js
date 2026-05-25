import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':        '/src',
      '@app':     '/src/app',
      '@features':'/src/features',
      '@core':    '/src/core',
      '@shared':  '/src/shared',
      '@styles':  '/src/styles',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
