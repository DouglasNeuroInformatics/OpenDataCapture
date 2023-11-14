import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

import './styles.css';

const root = document.getElementById('root')!;

if (import.meta.env.MODE === 'test') {
  const { worker } = await import('./test/server/browser');
  await worker.start();
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
