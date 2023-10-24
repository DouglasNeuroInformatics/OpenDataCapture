/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { CreateInstrumentPage } from './pages/CreateInstrumentPage';

export const instrumentsRoute: RouteObject = {
  path: 'instruments',
  children: [
    {
      path: 'create-instrument',
      element: <CreateInstrumentPage />
    }
  ]
};
