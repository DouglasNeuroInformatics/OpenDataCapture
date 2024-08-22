/* eslint-disable perfectionist/sort-objects */

import { Navigate, type RouteObject } from 'react-router-dom';

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
