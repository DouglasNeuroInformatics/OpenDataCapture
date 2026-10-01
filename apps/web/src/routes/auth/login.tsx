import { Card, Heading, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { Logo } from '@opendatacapture/react-core';
import type { $LoginCredentials, AuthPayload } from '@opendatacapture/schemas/auth';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';

import { DemoBanner } from '@/components/DemoBanner';
import { LoginBrandingPanel } from '@/components/LoginBranding';
import { LoginForm } from '@/components/LoginForm';
import { setupStateQueryOptions, useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useAppStore } from '@/store';
import { getRightPanelGradient } from '@/utils/branding';

type LoginResult = { accessToken: string; kind: 'success' } | { kind: 'archived' } | { kind: 'unauthorized' };

const loginRequest = async (credentials: $LoginCredentials): Promise<LoginResult> => {
  const response = await axios.post<AuthPayload>('/v1/auth/login', credentials, {
    validateStatus: (status) => status === 200 || status === 401 || status === 403
  });
  if (response.status === 403) {
    return { kind: 'archived' };
  }
  if (response.status === 401) {
    return { kind: 'unauthorized' };
  }
  return { accessToken: response.data.accessToken, kind: 'success' };
};

const RouteComponent = () => {
  const login = useAppStore((store) => store.login);
  const setupStateQuery = useSetupStateQuery();
  const notifications = useNotificationsStore();
  const { resolvedLanguage, t } = useTranslation('auth');
  const navigate = useNavigate();

  const branding = setupStateQuery.data.branding;
  const enableBranding = branding?.enableBranding === true;
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const instanceName = branding?.instanceName?.[resolvedLanguage]?.trim() || 'Open Data Capture';

  const handleLogin = async (credentials: $LoginCredentials) => {
    const result = await loginRequest(credentials);
    if (result.kind === 'archived') {
      notifications.addNotification({
        message: t({
          en: 'Your account has been archived. Please contact an administrator to restore it.',
          es: 'Su cuenta ha sido archivada. Comuníquese con un administrador para restaurarla.',
          fr: 'Votre compte a été archivé. Veuillez contacter un administrateur pour le restaurer.'
        }),
        title: t({
          en: 'Account Archived',
          es: 'Cuenta archivada',
          fr: 'Compte archivé'
        }),
        type: 'error'
      });
      return;
    }
    if (result.kind === 'unauthorized') {
      notifications.addNotification({
        message: t('unauthorizedError.message'),
        title: t('unauthorizedError.title'),
        type: 'error'
      });
      return;
    }
    login(result.accessToken);
    await navigate({ to: '/dashboard' });
  };

  if (!enableBranding) {
    return (
      <div className="flex min-h-screen w-full flex-col" data-testid="login-page">
        {setupStateQuery.data.isDemo && <DemoBanner onLogin={(credentials) => void handleLogin(credentials)} />}
        <div className="flex w-full grow flex-col items-center justify-center">
          <Card
            className="sm:bg-card w-full max-w-sm border-none bg-inherit px-2.5 py-1.5 sm:border-solid"
            data-testid="login-card"
          >
            <Card.Header className="flex items-center justify-center">
              <Logo className="m-1.5 h-auto w-16" variant="auto" />
              <Heading variant="h2">{t('login')}</Heading>
            </Card.Header>
            <Card.Content>
              <LoginForm onSubmit={(credentials) => void handleLogin(credentials)} />
            </Card.Content>
            <Card.Footer className="text-muted-foreground flex justify-between" data-testid="login-footer-toggles">
              <LanguageToggle
                align="start"
                options={{
                  en: 'English',
                  fr: 'Français'
                }}
                triggerClassName="border p-2"
                variant="ghost"
              />
              <ThemeToggle className="border p-2" variant="ghost" />
            </Card.Footer>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col" data-testid="login-page">
      {setupStateQuery.data.isDemo && <DemoBanner onLogin={(credentials) => void handleLogin(credentials)} />}
      <div className="flex grow flex-col lg:flex-row">
        <LoginBrandingPanel branding={branding} className="hidden lg:flex lg:w-1/2 xl:w-3/5" />
        <div
          className="bg-background flex w-full grow flex-col px-4 py-10 lg:w-1/2 xl:w-2/5"
          style={getRightPanelGradient(branding) ? { backgroundImage: getRightPanelGradient(branding)! } : undefined}
        >
          <Heading className="mb-8 text-center lg:hidden" variant="h3">
            {instanceName}
          </Heading>
          <Card
            className="my-auto w-full max-w-sm self-center border-none bg-inherit px-2.5 py-1.5 shadow-none sm:border-none"
            data-testid="login-card"
          >
            <Card.Header className="flex items-center justify-center">
              <Logo className="m-1.5 h-auto w-16" variant="auto" />
              <Heading variant="h2">{t('login')}</Heading>
            </Card.Header>
            <Card.Content>
              <LoginForm onSubmit={(credentials) => void handleLogin(credentials)} />
            </Card.Content>
            <Card.Footer className="text-muted-foreground flex justify-between" data-testid="login-footer-toggles">
              <LanguageToggle
                align="start"
                options={{
                  en: 'English',
                  fr: 'Français'
                }}
                triggerClassName="border p-2"
                variant="ghost"
              />
              <ThemeToggle className="border p-2" variant="ghost" />
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(setupStateQueryOptions())
});
