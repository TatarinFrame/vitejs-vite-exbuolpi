import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/auth';

// 1. Гарантированный синхронный рендер приложения
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// 2. Безопасный фоновый запуск MSW с перехватом ошибок
if (import.meta.env.DEV) {
  import('./mocks/browser')
    .then(({ worker }) => {
      return worker.start({
        onUnhandledRequest: 'bypass',
        quiet: true,
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
    })
    .catch((err) => {
      console.warn('MSW warning bypassed in container:', err);
    });
}