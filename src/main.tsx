import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

async function enableMocking() {
  // Используем встроенные переменные Vite
  if (import.meta.env.MODE !== 'development') {
    return;
  }
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'bypass', // чтобы не блокировать сторонние запросы
  });
}

enableMocking().catch((err) => {
  console.error('Ошибка инициализации MSW:', err);
}).finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});