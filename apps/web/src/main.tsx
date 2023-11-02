import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

import './styles.css';

const root = document.getElementById('root')!;

if (process.env.NODE_ENV === 'development') {
  // import('../msw/mocks/browser.jsx')
  //worker.start({ onUnhandledRequest: "bypass" })

}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
