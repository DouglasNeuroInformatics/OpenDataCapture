import React from 'react';
import { hydrateRoot } from 'react-dom/client';

import { Root } from './root';

import type { RootProps } from './root';

declare const __ROOT_PROPS__: RootProps;

hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <Root {...__ROOT_PROPS__} />
  </React.StrictMode>
);
