import type { $LoginCredentials, AuthPayload } from '@opendatacapture/schemas/auth';
import { createFileRoute, redirect } from '@tanstack/react-router';
import axios from 'axios';

import { Layout } from '@/components/Layout';
import { config } from '@/config';
import { setupStateQueryOptions } from '@/hooks/useSetupStateQuery';
import { DisclaimerProvider } from '@/providers/DisclaimerProvider';
import { ForceClearQueryCacheProvider } from '@/providers/ForceClearQueryCacheProvider';
import { WalkthroughProvider } from '@/providers/WalkthroughProvider';
import { useAppStore } from '@/store';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const setupState = await context.queryClient.fetchQuery(setupStateQueryOptions());
    if (!setupState.isSetup) {
      throw redirect({ to: '/setup' });
    }
    if (!useAppStore.getState().accessToken) {
      if (!(import.meta.env.DEV && import.meta.env.MODE !== 'test' && config.dev.isBypassAuthEnabled)) {
        throw redirect({ to: '/auth/login' });
      }
      const response = await axios.post<AuthPayload>('/v1/auth/login', {
        password: config.dev.password!,
        username: config.dev.username!
      } satisfies $LoginCredentials);
      useAppStore.getState().login(response.data.accessToken);
    }
    const { currentUser } = useAppStore.getState();
    // `_app` is the sole parent of every in-app route, so this one redirect is the whole lock. It is
    // for the user's benefit only: the token such a user holds carries no permission but to reset
    // their own password, so the API refuses everything else regardless of what the client does.
    if (currentUser?.mustResetPassword) {
      throw redirect({ to: '/auth/reset-password' });
    }
  },
  component: () => {
    return (
      <DisclaimerProvider>
        <WalkthroughProvider>
          <ForceClearQueryCacheProvider>
            <Layout />
          </ForceClearQueryCacheProvider>
        </WalkthroughProvider>
      </DisclaimerProvider>
    );
  }
});
