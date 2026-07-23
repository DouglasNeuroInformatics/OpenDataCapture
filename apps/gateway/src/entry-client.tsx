import React from 'react';
import ReactDOM from 'react-dom/client';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@douglasneuroinformatics/libui/i18n';

import { Root } from './Root';

import '@opendatacapture/react-core/globals.css';
import './globals.css';

const ROOT_PROPS = window.__ROOT_PROPS__;

const lang = ROOT_PROPS.lang ?? new URLSearchParams(window.location.search).get('lang') ?? undefined;
if (lang && ['en', 'es', 'fr'].includes(lang)) {
  i18n.changeLanguage(lang as Language);
}

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <Root {...ROOT_PROPS} />
  </React.StrictMode>
);
