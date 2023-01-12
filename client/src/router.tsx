import React from 'react';

import { createBrowserRouter } from 'react-router-dom';

import ErrorElement from './components/ErrorElement';
import HomePage from './routes/home';
import AddInstrumentPage from './routes/instruments/add-instrument';
import ViewInstrumentsPage from './routes/instruments/view-instruments';
import LoginPage, { loginAction } from './routes/login';
import Root from './routes/root';
import AddSubjectPage, { addSubjectAction } from './routes/subjects/add-subject';
import ViewSubjectsPage from './routes/subjects/view-subjects';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <React.Suspense>
        <Root />
      </React.Suspense>
    ),
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/home',
        element: <HomePage />
      },
      {
        path: '/subjects/add-subject',
        element: <AddSubjectPage />,
        action: addSubjectAction
      },
      {
        path: '/subjects/view-subjects',
        element: <ViewSubjectsPage />
      },
      {
        path: '/instruments/add-instrument',
        element: <AddInstrumentPage />
      },
      {
        path: '/instruments/view-instruments',
        element: <ViewInstrumentsPage />
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
