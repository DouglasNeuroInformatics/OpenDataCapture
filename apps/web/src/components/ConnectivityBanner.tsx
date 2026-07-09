import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { LoaderCircle, WifiOff } from 'lucide-react';

import { useAppStore } from '@/store';

/**
 * A subtle, non-blocking banner shown while the connection is degraded: either the browser reports it is
 * offline, or one or more requests are retrying after a transient network failure. It reassures users the
 * app is working through a flaky connection rather than broken.
 */
export const ConnectivityBanner = () => {
  const { t } = useTranslation();
  const isOnline = useAppStore((store) => store.isOnline);
  const isReconnecting = useAppStore((store) => store.pendingRetries > 0);

  if (isOnline && !isReconnecting) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center p-2" role="status">
      <div className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-900 shadow-sm dark:border-amber-800/60 dark:bg-amber-950 dark:text-amber-100">
        {isOnline ? (
          <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <WifiOff aria-hidden className="h-4 w-4" />
        )}
        <span>
          {isOnline
            ? t({
                en: 'Reconnecting…',
                fr: 'Reconnexion…'
              })
            : t({
                en: 'Offline — waiting for connection…',
                fr: 'Hors ligne — en attente de connexion…'
              })}
        </span>
      </div>
    </div>
  );
};
