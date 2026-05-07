import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.origin);
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Service worker registration is an enhancement; production UI stays quiet if it fails.
    });
  });
}
