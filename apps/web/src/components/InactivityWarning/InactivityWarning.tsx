import { useEffect, useState } from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ClockAlert } from 'lucide-react';

import { renewAccessToken } from '@/services/token-renewal';
import { useAppStore } from '@/store';

const WARNING_LEAD = 120_000;

const formatCountdown = (seconds: number) => {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

/**
 * Counts down the last two minutes of the access token. Shown to someone reading or watching
 * without touching anything, since any input renews the token and takes the warning away.
 */
export const InactivityWarning = () => {
  const { t } = useTranslation();
  const accessTokenValidity = useAppStore((store) => store.accessTokenValidity);
  const isReauthenticationRequired = useAppStore((store) => store.isReauthenticationRequired);
  const requireReauthentication = useAppStore((store) => store.requireReauthentication);
  const [secondsRemaining, setSecondsRemaining] = useState<null | number>(null);

  useEffect(() => {
    if (!accessTokenValidity) {
      setSecondsRemaining(null);
      return;
    }
    const update = () => {
      const remaining = accessTokenValidity.expiresAt - Date.now();
      setSecondsRemaining(remaining > 0 && remaining <= WARNING_LEAD ? Math.ceil(remaining / 1000) : null);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [accessTokenValidity]);

  if (!accessTokenValidity || secondsRemaining === null || isReauthenticationRequired) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4" role="alert">
      <div
        className="pointer-events-auto flex items-center gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 shadow-md dark:border-amber-800/60 dark:bg-amber-950 dark:text-amber-100"
        data-testid="inactivity-warning"
      >
        <ClockAlert aria-hidden className="h-4 w-4 shrink-0" />
        <span>
          {accessTokenValidity.isRenewable
            ? t({
                en: 'You will be signed out for inactivity in',
                es: 'Su sesión se cerrará por inactividad en',
                fr: 'Vous serez déconnecté pour inactivité dans'
              })
            : t({
                en: 'You will need to enter your password again in',
                es: 'Tendrá que volver a introducir su contraseña en',
                fr: 'Vous devrez saisir de nouveau votre mot de passe dans'
              })}{' '}
          <span aria-live="off" className="font-medium tabular-nums" data-testid="inactivity-warning-countdown">
            {formatCountdown(secondsRemaining)}
          </span>
        </span>
        {accessTokenValidity.isRenewable ? (
          <Button
            data-testid="inactivity-warning-stay-signed-in"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => void renewAccessToken()}
          >
            {t({ en: 'Stay signed in', es: 'Mantener la sesión', fr: 'Rester connecté' })}
          </Button>
        ) : (
          <Button
            data-testid="inactivity-warning-sign-in-again"
            size="sm"
            type="button"
            variant="outline"
            onClick={requireReauthentication}
          >
            {t({ en: 'Sign in again now', es: 'Iniciar sesión de nuevo ahora', fr: 'Se reconnecter maintenant' })}
          </Button>
        )}
      </div>
    </div>
  );
};
