import { useCallback, useEffect } from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ErrorPage } from '@opendatacapture/react-core';
import { useQueryClient } from '@tanstack/react-query';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { LoaderCircle, WifiOff } from 'lucide-react';

import { isTransientError } from '@/services/axios';
import { useAppStore } from '@/store';

/**
 * The router's default error component. For transient network failures (connection reset, DNS change,
 * offline, gateway errors) that survived the axios retry budget, it shows a calm, self-healing screen
 * that automatically recovers when the browser comes back online — instead of the terminal `ErrorPage`,
 * which is reserved for genuine application errors.
 */
export const AppErrorComponent = ({ error, reset }: ErrorComponentProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isOnline = useAppStore((store) => store.isOnline);

  const handleRetry = useCallback(() => {
    // Reset failed queries so they refetch, then clear the router's error boundary to re-render children.
    void queryClient.resetQueries();
    reset();
  }, [queryClient, reset]);

  // Auto-recover the moment the browser reports it is back online.
  useEffect(() => {
    window.addEventListener('online', handleRetry);
    return () => window.removeEventListener('online', handleRetry);
  }, [handleRetry]);

  if (!isTransientError(error)) {
    return <ErrorPage error={error} />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-1 p-3 text-center">
      {isOnline ? (
        <LoaderCircle aria-hidden className="text-muted-foreground h-8! w-8! animate-spin" />
      ) : (
        <WifiOff aria-hidden className="text-muted-foreground h-8! w-8!" />
      )}
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
        {t({ en: 'Connection Problem', fr: 'Problème de connexion' })}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm sm:text-base">
        {isOnline
          ? t({
              en: "We couldn't reach the server. This is usually temporary — please try again.",
              fr: 'Impossible de joindre le serveur. Le problème est généralement temporaire — veuillez réessayer.'
            })
          : t({
              en: "You appear to be offline. We'll reconnect automatically as soon as your connection returns.",
              fr: 'Vous semblez être hors ligne. La reconnexion se fera automatiquement dès le retour de votre connexion.'
            })}
      </p>
      <div className="mt-6">
        <Button type="button" variant="primary" onClick={handleRetry}>
          {t({ en: 'Try again', fr: 'Réessayer' })}
        </Button>
      </div>
    </div>
  );
};
