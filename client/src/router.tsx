import React from 'react';

import { createBrowserRouter } from 'react-router-dom';

import ErrorElement from './components/ErrorElement';
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
    errorElement: <ErrorElement />,
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
    action: loginAction,
    errorElement: <ErrorElement />
  }
]);

export default router;
