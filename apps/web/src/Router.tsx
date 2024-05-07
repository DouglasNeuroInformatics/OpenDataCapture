/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { BrowserRouter, Navigate, type RouteObject, useRoutes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { authRoutes } from './features/auth';
import { contactRoute } from './features/contact';
import { dashboardRoute } from './features/dashboard';
import { groupRoute } from './features/group';
import { instrumentsRoute } from './features/instruments';
import { sessionRoute } from './features/session';
import { subjectsRoute } from './features/subjects';
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
    children: [contactRoute, dashboardRoute, groupRoute, instrumentsRoute, sessionRoute, subjectsRoute, userRoute]
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
