/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import type { RouteObject } from 'react-router-dom';

import { AccessibleInstrumentsPage } from './pages/AccessibleInstrumentsPage';
import { InstrumentRenderPage } from './pages/InstrumentRenderPage';

export const instrumentsRoute: RouteObject = {
  path: 'instruments',
  children: [
    {
      path: 'accessible-instruments',
      element: <AccessibleInstrumentsPage />
    },
    {
      path: 'render/:id',
      element: <InstrumentRenderPage />
    }
  ]
};
