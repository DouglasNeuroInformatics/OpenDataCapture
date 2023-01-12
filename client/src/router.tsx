import React from 'react';

import { createBrowserRouter } from 'react-router-dom';

import ErrorElement from './components/ErrorElement';
import HomePage from './routes/home';
import AddInstrumentPage from './routes/instruments/add-instrument';
import ViewInstrumentsPage from './routes/instruments/view-instruments';
import LoginPage from './routes/login';
import Root from './routes/root';
import AddSubjectPage from './routes/subjects/add-subject';
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
        element: <AddSubjectPage />
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
    errorElement: <ErrorElement />
  }
]);

export default router;
