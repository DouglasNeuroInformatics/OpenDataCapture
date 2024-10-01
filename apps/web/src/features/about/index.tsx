/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { AboutPage } from './pages/AboutPage';

export const aboutRoute: RouteObject = {
  path: 'about',
  element: <AboutPage />
};
