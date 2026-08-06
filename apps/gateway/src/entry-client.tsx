import React from 'react';
import ReactDOM from 'react-dom/client';

import { Root } from './Root';
import { i18n } from './services/i18n';
import { localizeValidationErrors } from './services/zod';

import '@opendatacapture/react-core/globals.css';
import './globals.css';

const ROOT_PROPS = window.__ROOT_PROPS__;

// Set before hydrating so the client resolves the same language the server rendered.
i18n.changeLanguage(ROOT_PROPS.language);

localizeValidationErrors().catch(console.error);

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <Root {...ROOT_PROPS} />
  </React.StrictMode>
);
