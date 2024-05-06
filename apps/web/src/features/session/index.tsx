/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import type { RouteObject } from 'react-router-dom';

import { StartSessionPage } from './pages/StartSessionPage';

export const sessionRoute: RouteObject = {
  path: 'session',
  children: [
    {
      path: 'start-session',
      element: <StartSessionPage />
    }
  ]
};
