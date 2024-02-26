/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { AvailableInstrumentsPage } from './pages/AvailableInstrumentsPage';
import { InstrumentRenderPage } from './pages/InstrumentRenderPage';

export const instrumentsRoute: RouteObject = {
  path: 'instruments',
  children: [
    {
      path: 'available-instruments',
      element: <AvailableInstrumentsPage />
    },
    {
      path: 'render/:id',
      element: <InstrumentRenderPage />
    }
  ]
};
