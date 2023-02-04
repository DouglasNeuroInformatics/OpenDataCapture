import React from 'react';

import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { AdminPage } from './features/admin';
import { LoginPage } from './features/auth';
import { AddInstrumentPage, InstrumentPage, ViewInstrumentsPage } from './features/instruments';
import { ErrorPage, HomePage } from './features/misc';
import { AddSubjectPage, SubjectPage, ViewSubjectsPage } from './features/subjects';
import { SubjectLookupPage } from './features/subjects/pages/SubjectLookupPage';
import { useAuthStore } from './stores/auth-store';

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
        path: '/admin',
        element: <AdminPage />
      },
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
