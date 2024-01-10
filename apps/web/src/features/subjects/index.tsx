/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { SubjectLayout } from './components/SubjectLayout';
import { SubjectAssignmentsPage } from './pages/SubjectAssignmentsPage';
import { SubjectGraphPage } from './pages/SubjectGraphPage';
import { SubjectIndexPage } from './pages/SubjectIndexPage';
import { SubjectTablePage } from './pages/SubjectTablePage';

export const subjectsRoute: RouteObject = {
  path: 'subjects',
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
          element: <SubjectAssignmentsPage />
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
