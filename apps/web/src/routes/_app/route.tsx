import { createFileRoute, redirect } from '@tanstack/react-router';

import { Layout } from '@/components/Layout';
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
    const { accessToken, currentUser } = useAppStore.getState();
    if (!accessToken) {
      throw redirect({ to: '/auth/login' });
    }
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
