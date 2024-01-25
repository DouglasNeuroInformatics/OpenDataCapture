import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { App } from './App';

export type RenderFunction = (...args: any[]) => { html: string };

export const render: RenderFunction = () => {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  return { html };
};
