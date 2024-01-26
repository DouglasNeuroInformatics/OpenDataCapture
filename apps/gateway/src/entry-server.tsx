import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { Root, type RootProps } from './Root';

export type RenderFunction = (props: RootProps) => { html: string };

export const render: RenderFunction = (props) => {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <Root {...props} />
    </React.StrictMode>
  );
  return { html };
};
