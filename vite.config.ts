import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/vitejs-vite-exbuolpi/',
  optimizeDeps: {
    exclude: ['@mui/material', '@mui/icons-material', 'msw'],
  },
});