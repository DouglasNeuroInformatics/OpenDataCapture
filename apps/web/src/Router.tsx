/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { BrowserRouter, Navigate, type RouteObject, useRoutes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { authRoutes } from './features/auth';
import { contactRoute } from './features/contact';
import { dashboardRoute } from './features/dashboard';
import { datahubRoute } from './features/datahub';
import { groupRoute } from './features/group';
import { instrumentsRoute } from './features/instruments';
import { sessionRoute } from './features/session';
import { userRoute } from './features/user';
import { useAppStore } from './store';

const publicRoutes: RouteObject[] = [
  authRoutes,
  {
    path: '*',
    element: <Navigate to="/auth/login" />
  }
];

const protectedRoutes: RouteObject[] = [
  authRoutes,
  {
    element: <Layout />,
    children: [contactRoute, datahubRoute, dashboardRoute, groupRoute, instrumentsRoute, sessionRoute, userRoute]
  }
];

export const AppRoutes = () => {
  const accessToken = useAppStore((store) => store.accessToken);
  return useRoutes(accessToken ? protectedRoutes : publicRoutes);
};

export const Router = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};
