import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vitejs-vite-exbuolpi/',
  optimizeDeps: {
    // Исключаем библиотеки, вызывающие OOM в WASM-компиляторе WebContainer
    exclude: ['@mui/material', '@mui/icons-material', 'msw'],
  },
});