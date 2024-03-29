/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { OverviewPage } from './pages/OverviewPage';

export const overviewRoute: RouteObject = {
  path: 'overview',
  element: <OverviewPage />
};
