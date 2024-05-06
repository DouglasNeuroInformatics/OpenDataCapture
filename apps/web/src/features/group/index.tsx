/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import type { RouteObject } from 'react-router-dom';

import { ManageGroupPage } from './pages/ManageGroupPage';

export const groupRoute: RouteObject = {
  path: 'group',
  children: [
    {
      path: 'manage',
      element: <ManageGroupPage />
    }
  ]
};
