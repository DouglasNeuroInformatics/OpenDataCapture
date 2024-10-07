/* eslint-disable perfectionist/sort-objects */

import { Navigate, useRoutes } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { Layout } from './components/Layout';
import { aboutRoute } from './features/about';
import { adminRoute } from './features/admin';
import { authRoutes } from './features/auth';
import { contactRoute } from './features/contact';
import { dashboardRoute } from './features/dashboard';
import { datahubRoute } from './features/datahub';
import { groupRoute } from './features/group';
import { instrumentsRoute } from './features/instruments';
import { sessionRoute } from './features/session';
import { userRoute } from './features/user';
import { DisclaimerProvider } from './providers/DisclaimerProvider';
import { WalkthroughProvider } from './providers/WalkthroughProvider';
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
    element: (
      <DisclaimerProvider>
        <WalkthroughProvider>
          <Layout />
        </WalkthroughProvider>
      </DisclaimerProvider>
    ),
    children: [
      adminRoute,
      aboutRoute,
      contactRoute,
      datahubRoute,
      dashboardRoute,
      groupRoute,
      instrumentsRoute,
      sessionRoute,
      userRoute
    ]
  }
];

export const Routes = () => {
  const accessToken = useAppStore((store) => store.accessToken);
  return useRoutes(accessToken ? protectedRoutes : publicRoutes);
};
