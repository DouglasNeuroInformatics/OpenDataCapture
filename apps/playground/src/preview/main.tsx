import React from 'react';
import ReactDOM from 'react-dom/client';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { CoreProvider } from '@douglasneuroinformatics/libui/providers';

import { PreviewApp } from './PreviewApp';

import './preview.css';

const root = document.getElementById('root')!;

i18n.init({
  translations: {}
});

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <CoreProvider>
      <PreviewApp />
    </CoreProvider>
  </React.StrictMode>
);
