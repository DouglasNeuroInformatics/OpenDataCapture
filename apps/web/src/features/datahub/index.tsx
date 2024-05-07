/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { Navigate, type RouteObject } from 'react-router-dom';

import { config } from '@/config';

import { SubjectLayout } from './components/SubjectLayout';
import { SubjectAssignmentsPage } from './pages/SubjectAssignmentsPage';
import { SubjectGraphPage } from './pages/SubjectGraphPage';
import { SubjectIndexPage } from './pages/SubjectIndexPage';
import { SubjectTablePage } from './pages/SubjectTablePage';

export const datahubRoute: RouteObject = {
  path: 'datahub',
  children: [
    {
      index: true,
      element: <SubjectIndexPage />
    },
    {
      path: ':subjectId',
      element: <SubjectLayout />,
      children: [
        {
          path: 'assignments',
          element: config.setup.isGatewayEnabled ? <SubjectAssignmentsPage /> : <Navigate to="../table" />
        },
        {
          path: 'graph',
          element: <SubjectGraphPage />
        },
        {
          path: 'table',
          element: <SubjectTablePage />
        }
      ]
    }
  ]
};
