/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { CreateInstrumentPage } from './pages/CreateInstrumentPage';
import { ManageInstrumentsPage } from './pages/ManageInstrumentsPage';

export const instrumentsRoute: RouteObject = {
  path: 'instruments',
  children: [
    {
      path: 'create-instrument',
      element: <CreateInstrumentPage />
    },
    {
      path: 'manage-instruments',
      element: <ManageInstrumentsPage />
    }
  ]
};
