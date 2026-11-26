import { useState } from 'react';

import { Button, Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { z } from 'zod/v4';

import { useLoginMutation } from '@/hooks/useLoginMutation';
import { isTransientError } from '@/services/axios';
import { useAppStore } from '@/store';

/** A reason the tab cannot carry on under any password, leaving only sign out. */
type Refusal = 'archived' | 'differentUser' | 'disabled' | 'mustResetPassword';

/**
 * Asks for the password again once the access token has run out, over whatever the user was doing.
 * Requests that failed for want of a token wait behind it and are sent again on success, so nothing
 * below unmounts and an instrument in progress keeps what was entered.
 */
export const ReauthenticationDialog = () => {
  const { t } = useTranslation('auth');
  const currentUser = useAppStore((store) => store.currentUser);
  const isReauthenticationRequired = useAppStore((store) => store.isReauthenticationRequired);
  const logout = useAppStore((store) => store.logout);
  const reauthenticate = useAppStore((store) => store.reauthenticate);
  // A failed request is explained beside the form, where the user is looking.
  const loginMutation = useLoginMutation({ disableDefaultErrorNotification: true });
  const [refusal, setRefusal] = useState<null | Refusal>(null);

  if (!currentUser) {
    return null;
  }

  const refusalMessages: { [K in Refusal]: string } = {
    archived: t('archivedError.message'),
    differentUser: t({
      en: 'This account could not be confirmed as yours. Sign out, then sign in again.',
      es: 'No se pudo confirmar que esta cuenta sea la suya. Cierre la sesión y vuelva a iniciarla.',
      fr: 'Impossible de confirmer que ce compte est le vôtre. Déconnectez-vous, puis reconnectez-vous.'
    }),
    disabled: t('disabledError.message'),
    mustResetPassword: t({
      en: 'Your password must be changed. Sign out, then sign in to choose a new one.',
      es: 'Debe cambiar su contraseña. Cierre la sesión y vuelva a iniciarla para elegir una nueva.',
      fr: 'Votre mot de passe doit être changé. Déconnectez-vous, puis reconnectez-vous pour en choisir un nouveau.'
    })
  };

  const handleSubmit = async ({
    password
  }: {
    password: string;
  }): Promise<void | { errorMessage: string; success: false }> => {
    let result;
    try {
      result = await loginMutation.mutateAsync({ password, username: currentUser.username });
    } catch (error) {
      return {
        errorMessage: isTransientError(error)
          ? t({
              en: 'Could not reach the server. Check your connection and try again.',
              es: 'No se pudo contactar con el servidor. Compruebe su conexión e inténtelo de nuevo.',
              fr: 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.'
            })
          : t({
              en: 'Sign-in failed. Try again in a moment.',
              es: 'No se pudo iniciar sesión. Inténtelo de nuevo en un momento.',
              fr: 'La connexion a échoué. Réessayez dans un instant.'
            }),
        success: false
      };
    }
    if (result.kind === 'unauthorized') {
      return { errorMessage: t('unauthorizedError.message'), success: false };
    }
    if (result.kind !== 'success') {
      setRefusal(result.kind);
      return;
    }
    const outcome = reauthenticate(result.accessToken);
    if (outcome !== 'accepted') {
      setRefusal(outcome);
    }
  };

  return (
    <Dialog open={isReauthenticationRequired}>
      <Dialog.Content
        // The panel fills the window and is opaque, so what was on the page cannot be read behind it.
        // libui renders a close button as a direct child; this dialog closes only by signing in,
        // which is also why it takes no `onOpenChange`.
        className="top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 items-center justify-center rounded-none border-0 sm:max-w-none sm:rounded-none [&>button]:hidden"
        data-testid="reauthentication-dialog"
      >
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Dialog.Header>
            <Dialog.Title>
              {t({ en: 'Sign in again', es: 'Inicie sesión de nuevo', fr: 'Reconnectez-vous' })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'Enter your password to continue where you left off.',
                es: 'Introduzca su contraseña para continuar donde lo dejó.',
                fr: 'Saisissez votre mot de passe pour reprendre là où vous en étiez.'
              })}
            </Dialog.Description>
          </Dialog.Header>
          <p className="text-sm">
            <span className="text-muted-foreground">{t('username')}: </span>
            <span className="font-medium" data-testid="reauthentication-username">
              {currentUser.username}
            </span>
          </p>
          {refusal ? (
            <p className="text-destructive text-sm" data-testid="reauthentication-refusal" role="alert">
              {refusalMessages[refusal]}
            </p>
          ) : (
            <Form
              content={{
                password: {
                  kind: 'string',
                  label: t('password'),
                  variant: 'password'
                }
              }}
              data-testid="reauthentication-form"
              submitBtnLabel={t('login')}
              validationSchema={z.object({ password: z.string().min(1) })}
              onSubmit={handleSubmit}
            />
          )}
          <Button data-testid="reauthentication-sign-out" type="button" variant="outline" onClick={logout}>
            {t('signOut')}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
