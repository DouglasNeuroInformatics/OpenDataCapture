import React from 'react';
import ReactDOM from 'react-dom/client';

import { Root } from './Root';

import '@opendatacapture/react-core/globals.css';

const ROOT_PROPS = window.__ROOT_PROPS__;

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <Root {...ROOT_PROPS} />
  </React.StrictMode>
);
