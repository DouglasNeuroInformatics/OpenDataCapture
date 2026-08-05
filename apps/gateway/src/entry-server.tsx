import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { Root } from './Root';
import { i18n } from './services/i18n';

import type { RootProps } from './Root';

export type RenderFunction = (props: RootProps) => { html: string };

export const render: RenderFunction = (props) => {
  i18n.changeLanguage(props.language);
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <Root {...props} />
    </React.StrictMode>
  );
  return { html };
};
