import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { App, type AppProps } from './App';

export type RenderFunction = (props: AppProps) => { html: string };

export const render: RenderFunction = (props) => {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <App {...props} />
    </React.StrictMode>
  );
  return { html };
};
