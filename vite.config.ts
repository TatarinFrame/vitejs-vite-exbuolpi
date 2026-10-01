import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import path from 'path';
export default defineConfig({
  base: '/vitejs-vite-exbuolpi/',
    plugins: [react()],
    server: {
      host: true,        // Прослушивание на всех интерфейсах (0.0.0.0)
      port: 5173,        // Фиксированный порт
      strictPort: true,  // Не переключать порт при конфликте
    },
});