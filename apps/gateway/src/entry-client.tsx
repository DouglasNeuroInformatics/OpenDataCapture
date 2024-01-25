import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

import '@open-data-capture/react-core/styles.css';

const APP_PROPS = window.__APP_PROPS__;

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <App {...APP_PROPS} />
  </React.StrictMode>
);
