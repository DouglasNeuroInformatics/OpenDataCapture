/* eslint-disable perfectionist/sort-objects */

import type { RouteObject } from 'react-router-dom';

import { CreateGroupPage } from './pages/CreateGroupPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { ManageGroupsPage } from './pages/ManageGroupsPage';
import { ManageUsersPage } from './pages/ManageUsersPage';

export const adminRoute: RouteObject = {
  path: 'admin',
  children: [
    {
      path: 'groups',
      children: [
        {
          index: true,
          element: <ManageGroupsPage />
        },
        {
          path: 'create',
          element: <CreateGroupPage />
        }
      ]
    },
    {
      path: 'users',
      children: [
        {
          index: true,
          element: <ManageUsersPage />
        },
        {
          path: 'create',
          element: <CreateUserPage />
        }
      ]
    }
  ]
};
