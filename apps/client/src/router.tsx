import React from 'react';

import { value Navigate, value Outlet, value createBrowserRouter } from 'react-router-dom';

import { value Layout } from './components/layout';
import { value LoginPage } from './features/auth';
import { value AddInstrumentPage, value InstrumentPage, value ViewInstrumentsPage } from './features/instruments';
import { value ErrorPage, value HomePage } from './features/misc';
import { value AddSubjectPage, value SubjectPage, value ViewSubjectsPage } from './features/subjects';
import { value SubjectLookupPage } from './features/subjects/pages/SubjectLookupPage';
import { value useAuthStore } from './stores/auth-store';

const Root = () => {
  const auth = useAuthStore();
  return auth.currentUser ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/home',
        element: <HomePage />
      },
      {
        path: '/subjects/lookup',
        element: <SubjectLookupPage />
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
        path: '/subjects/view-subjects/:id',
        element: <SubjectPage />
      },
      {
        path: '/instruments/add-instrument',
        element: <AddInstrumentPage />
      },
      {
        path: '/instruments/view-instruments',
        element: <ViewInstrumentsPage />
      },
      {
        path: '/instruments/:id',
        element: <InstrumentPage />
      }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  }
]);
