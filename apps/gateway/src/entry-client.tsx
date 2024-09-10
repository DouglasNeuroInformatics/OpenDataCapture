import React from 'react';
import ReactDOM from 'react-dom/client';

import { Root } from './Root';

import '@douglasneuroinformatics/libui/tailwind/globals.css';

const ROOT_PROPS = window.__ROOT_PROPS__;

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <Root {...ROOT_PROPS} />
  </React.StrictMode>
);
