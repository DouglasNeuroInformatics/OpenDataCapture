/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { BrowserRouter, Navigate, type RouteObject, useRoutes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { authRoutes } from './features/auth';
import { contactRoute } from './features/contact';
import { instrumentsRoute } from './features/instruments';
import { overviewRoute } from './features/overview';
import { subjectsRoute } from './features/subjects';
import { userRoute } from './features/user';
import { visitsRoute } from './features/visits';
import { useAuthStore } from './stores/auth-store';

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
    children: [contactRoute, instrumentsRoute, overviewRoute, subjectsRoute, userRoute, visitsRoute]
  }
];

export const AppRoutes = () => {
  const { accessToken } = useAuthStore();
  return useRoutes(accessToken ? protectedRoutes : publicRoutes);
};

export const Router = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};
