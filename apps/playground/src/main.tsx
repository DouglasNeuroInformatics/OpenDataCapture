import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

import './styles.css';

const root = document.getElementById('root')!;

// React must be in global scope as indirect eval is used for instrument
window.React = React;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
