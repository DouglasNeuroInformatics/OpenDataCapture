/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { UserPage } from './pages/UserPage';

export const userRoute: RouteObject = {
  path: 'user',
  element: <UserPage />
};
