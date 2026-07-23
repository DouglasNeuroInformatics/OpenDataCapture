import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@douglasneuroinformatics/libui/i18n';

import { Root } from './Root';

import type { RootProps } from './Root';

export type RenderFunction = (props: RootProps) => { html: string };

export const render: RenderFunction = (props) => {
  if (props.lang && ['en', 'es', 'fr'].includes(props.lang)) {
    i18n.changeLanguage(props.lang as Language);
  }
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <Root {...props} />
    </React.StrictMode>
  );
  return { html };
};
