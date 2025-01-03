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
import { uploadRoute } from './features/upload';
import { userRoute } from './features/user';
import { DisclaimerProvider } from './providers/DisclaimerProvider';
import { ForceClearQueryCacheProvider } from './providers/ForceClearQueryCacheProvider';
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
          <ForceClearQueryCacheProvider>
            <Layout />
          </ForceClearQueryCacheProvider>
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
      userRoute,
      uploadRoute
    ]
  }
];

export const Routes = () => {
  const accessToken = useAppStore((store) => store.accessToken);
  return useRoutes(accessToken ? protectedRoutes : publicRoutes);
};
