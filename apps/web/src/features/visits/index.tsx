/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { AddVisitPage } from './pages/AddVisitPage';

export const visitsRoute: RouteObject = {
  path: 'visits',
  children: [
    {
      path: 'add-visit',
      element: <AddVisitPage />
    }
  ]
};
