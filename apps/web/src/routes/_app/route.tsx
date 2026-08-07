import { createFileRoute, redirect } from '@tanstack/react-router';

import { Layout } from '@/components/Layout';
import { setupStateQueryOptions } from '@/hooks/useSetupStateQuery';
import { DisclaimerProvider } from '@/providers/DisclaimerProvider';
import { ForceClearQueryCacheProvider } from '@/providers/ForceClearQueryCacheProvider';
import { WalkthroughProvider } from '@/providers/WalkthroughProvider';
import { useAppStore } from '@/store';
import { reconcileInterfaceLanguage } from '@/services/i18n';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const setupState = await context.queryClient.fetchQuery(setupStateQueryOptions());
    if (!setupState.isSetup) {
      throw redirect({ to: '/setup' });
    }
    const { accessToken } = useAppStore.getState();
    if (!accessToken) {
      throw redirect({ to: '/auth/login' });
    }
    // Before the tree renders, so no component has to be told after the fact.
    reconcileInterfaceLanguage(setupState.activeLanguages);
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
