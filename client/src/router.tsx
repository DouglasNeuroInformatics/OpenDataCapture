import React from 'react';

import { createBrowserRouter } from 'react-router-dom';

import HomePage from './routes/home';
import LoginPage, { loginAction } from './routes/login';
import Root, { rootLoader } from './routes/root';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <React.Suspense>
        <Root />
      </React.Suspense>
    ),
    loader: rootLoader,
    children: [
      {
        path: '/home',
        element: <HomePage />
      }
    ]
  },
  {
    path: '/login',
    element: (
      <React.Suspense>
        <LoginPage />
      </React.Suspense>
    ),
    action: loginAction
  }
]);

export default router;
