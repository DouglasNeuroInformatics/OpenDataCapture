/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import type { RouteObject } from 'react-router-dom';

import { AvailableInstrumentsPage } from './pages/AvailableInstrumentsPage';
import { InstrumentRenderPage } from './pages/InstrumentRenderPage';

export const instrumentsRoute: RouteObject = {
  path: 'instruments',
  children: [
    {
      path: 'accessible-instruments',
      element: <AvailableInstrumentsPage />
    },
    {
      path: 'render/:id',
      element: <InstrumentRenderPage />
    }
  ]
};
