import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

import '@douglasneuroinformatics/libui/styles/globals.css';

const root = document.getElementById('root')!;

if (import.meta.env.MODE === 'test') {
  const worker = await import('./testing/server/browser').then((module) => module.worker);
  await worker.start();
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
