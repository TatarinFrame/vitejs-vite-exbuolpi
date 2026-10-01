import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/auth';

// Guaranteed UI render
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Background MSW initialization with error suppression for WebContainers
if (import.meta.env.DEV) {
  import('./mocks/browser')
    .then(({ worker }) => {
      return worker.start({
        onUnhandledRequest: 'bypass',
        quiet: true,
      });
    })
    .catch((err) => {
      console.warn('MSW worker failed to start in WebContainer:', err);
    });
}