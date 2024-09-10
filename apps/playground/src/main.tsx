import React from 'react';
import ReactDOM from 'react-dom/client';

import { i18n } from '@douglasneuroinformatics/libui/i18n';

import { App } from './App';

import '@douglasneuroinformatics/libui/tailwind/globals.css';

const root = document.getElementById('root')!;

i18n.init();

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
