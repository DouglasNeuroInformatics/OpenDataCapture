import { useMemo, useState } from 'react';

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Button, Card, Form, Heading, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { LanguageToggle, Logo } from '@opendatacapture/react-core';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { usePasswordErrorMessage } from '@/hooks/usePasswordErrorMessage';
import { useResetPasswordMutation } from '@/hooks/useResetPasswordMutation';
import { setupStateQueryOptions, useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useAppStore } from '@/store';

type ResetPasswordFormData = {
  confirmPassword: string;
  password: string;
};

const RouteComponent = () => {
  const { resolvedLanguage, t } = useTranslation();
  const currentUser = useAppStore((store) => store.currentUser);
  const logout = useAppStore((store) => store.logout);
  const resetPasswordMutation = useResetPasswordMutation();
  const setupStateQuery = useSetupStateQuery();
  const passwordErrorMessage = usePasswordErrorMessage();
  const notifications = useNotificationsStore();
  const [isChanged, setIsChanged] = useState(false);

  const $ResetPasswordFormData = useMemo(() => {
    return z
      .object({
        confirmPassword: z.string().min(1),
        password: z.string().min(1)
      })
      .check((ctx) => {
        if (!estimatePasswordStrength(ctx.value.password).success) {
          ctx.issues.push({
            code: 'custom',
            fatal: true,
            input: ctx.value.password,
            message: t('common.insufficientPasswordStrength'),
            path: ['password']
          });
          return z.NEVER;
        }
        if (ctx.value.password.toLowerCase() === currentUser!.username.toLowerCase()) {
          ctx.issues.push({
            code: 'custom',
            fatal: true,
            input: ctx.value.password,
            message: t('common.passwordMatchesUsername'),
            path: ['password']
          });
          return z.NEVER;
        }
        if (ctx.value.confirmPassword !== ctx.value.password) {
          ctx.issues.push({
            code: 'custom',
            input: ctx.value.confirmPassword,
            message: t('common.passwordsMustMatch'),
            path: ['confirmPassword']
          });
        }
      }) satisfies z.ZodType<ResetPasswordFormData>;
  }, [currentUser!.username, resolvedLanguage]);

  const handleSubmit = ({ password }: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(
      { id: currentUser!.id, password },
      {
        onError: (err) => {
          notifications.addNotification({
            message: passwordErrorMessage(
              err,
              t({
                en: 'Failed to change password',
                es: 'No se pudo cambiar la contraseña',
                fr: 'Échec du changement de mot de passe'
              })
            ),
            type: 'error'
          });
        },
        onSuccess: () => setIsChanged(true)
      }
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col" data-testid="reset-password-page">
      <div className="flex w-full grow flex-col items-center justify-center">
        <Card className="w-full max-w-sm" data-testid="reset-password-card">
          <Card.Header className="flex items-center justify-center">
            <Logo className="m-1.5 h-auto w-16" variant="auto" />
            <Heading variant="h3">
              {t({
                en: 'Choose a new password',
                es: 'Elija una nueva contraseña',
                fr: 'Choisissez un nouveau mot de passe'
              })}
            </Heading>
          </Card.Header>
          <Card.Content>
            {isChanged ? (
              <div className="flex flex-col gap-4" data-testid="reset-password-success">
                <p className="text-muted-foreground text-sm">
                  {t({
                    en: 'Your password has been changed. Sign in again to continue.',
                    es: 'Su contraseña ha sido cambiada. Inicie sesión de nuevo para continuar.',
                    fr: 'Votre mot de passe a été modifié. Connectez-vous de nouveau pour continuer.'
                  })}
                </p>
                <Button type="button" onClick={logout}>
                  {t({ en: 'Sign in', es: 'Iniciar sesión', fr: 'Se connecter' })}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-4 text-sm">
                  {t({
                    en: 'Your password was set for you, so you must choose your own before you can use the app.',
                    es: 'Su contraseña fue definida por otra persona, así que debe elegir la suya antes de poder usar la aplicación.',
                    fr: "Votre mot de passe a été défini pour vous ; vous devez en choisir un vous-même avant de pouvoir utiliser l'application."
                  })}
                </p>
                <Form
                  content={{
                    password: {
                      calculateStrength: (password) => estimatePasswordStrength(password).score,
                      kind: 'string',
                      label: t('common.password'),
                      variant: 'password'
                    },
                    // eslint-disable-next-line perfectionist/sort-objects
                    confirmPassword: {
                      kind: 'string',
                      label: t('common.confirmPassword'),
                      variant: 'password'
                    }
                  }}
                  data-form-type="other"
                  data-lpignore="true"
                  data-testid="reset-password-form"
                  submitBtnLabel={t({
                    en: 'Change password',
                    es: 'Cambiar la contraseña',
                    fr: 'Changer le mot de passe'
                  })}
                  validationSchema={$ResetPasswordFormData}
                  onSubmit={handleSubmit}
                />
              </>
            )}
          </Card.Content>
          <Card.Footer className="text-muted-foreground flex items-center justify-between">
            <div className="flex gap-1">
              <LanguageToggle
                activeLanguages={setupStateQuery.data.activeLanguages}
                align="start"
                triggerClassName="border p-2"
                variant="ghost"
              />
              <ThemeToggle className="border p-2" variant="ghost" />
            </div>
            {!isChanged && (
              <Button size="sm" type="button" variant="ghost" onClick={logout}>
                {t({ en: 'Sign out', es: 'Cerrar sesión', fr: 'Se déconnecter' })}
              </Button>
            )}
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/auth/reset-password')({
  beforeLoad: () => {
    const { accessToken, currentUser } = useAppStore.getState();
    if (!accessToken) {
      throw redirect({ to: '/auth/login' });
    }
    if (!currentUser?.mustResetPassword) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(setupStateQueryOptions())
});
