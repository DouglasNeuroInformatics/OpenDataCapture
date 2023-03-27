import React from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components';
import { LoginPage } from './features/auth';
import { ContactPage } from './features/contact';
import { OverviewPage } from './features/overview/pages/OverviewPage';
import { UserPage } from './features/user';
import { useAuthStore } from './stores/auth-store';

export const Router = () => {
  const { accessToken } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="login" />
        {accessToken ? (
          <Route element={<Layout />}>
            <Route index element={<OverviewPage />} path="overview" />
            <Route element={<ContactPage />} path="contact" />
            <Route element={<UserPage />} path="user" />
          </Route>
        ) : (
          <Route element={<Navigate to="login" />} path="*" />
        )}
      </Routes>
    </BrowserRouter>
  );
};
/*
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';

import { Layout } from './components/layout';
import { AdminPage } from './features/admin';
import { LoginPage } from './features/auth';
import { AddInstrumentPage, InstrumentPage, ViewInstrumentsPage } from './features/instruments';
import { ErrorPage, HomePage } from './features/misc';
import { AddSubjectPage, SubjectPage, SubjectRecordsPage, ViewSubjectsPage } from './features/subjects';
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
        path: '/subjects/add-subject',
        element: <AddSubjectPage />
      },
      {
        path: '/subjects/view-subjects',
        element: <ViewSubjectsPage />
      },
      {
        path: '/subjects/view-subjects/:subjectId',
        element: <SubjectPage />
      },
      {
        path: '/subjects/view-subjects/:subjectId/records/:instrumentTitle',
        element: <SubjectRecordsPage />
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
    element: <LoginPage />,
    errorElement: <ErrorPage />
  }
]);
*/
