import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/auth';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Фоновый запуск MSW: ошибки не должны ронять приложение
if (import.meta.env.DEV) {
  import('./mocks/browser')
    .then(({ worker }) =>
      worker.start({
        onUnhandledRequest: 'bypass',
        quiet: true,
        serviceWorker: {
          url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        },
      })
    )
    .catch((err) => {
      console.warn('MSW не запустился:', err);
    });
}