/* eslint-disable perfectionist/sort-objects */

import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { LoginPage } from './pages/LoginPage';

export const authRoutes: RouteObject = {
  path: 'auth',
  children: [
    {
      path: 'login',
      element: <LoginPage />
    },
    {
      index: true,
      path: '*',
      element: <Navigate to="/auth/login" />
    }
  ]
};
