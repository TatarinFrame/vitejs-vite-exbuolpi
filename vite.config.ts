import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/vitejs-vite-exbuolpi/' : '/',
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      'hoist-non-react-statics',
    ],
  },
}));