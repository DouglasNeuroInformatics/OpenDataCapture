import { Card, Heading, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { Logo } from '@opendatacapture/react-core';
import type { $LoginCredentials, AuthPayload } from '@opendatacapture/schemas/auth';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import axios from 'axios';

import { DemoBanner } from '@/components/DemoBanner';
import { LoginForm } from '@/components/LoginForm';
import { config } from '@/config';
import { setupStateQueryOptions, useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useAppStore } from '@/store';

const loginRequest = async (
  credentials: $LoginCredentials
): Promise<{ accessToken: string; success: true } | { success: false }> => {
  const response = await axios.post<AuthPayload>('/v1/auth/login', credentials, {
    validateStatus: (status) => status === 200 || status === 401
  });
  if (response.status === 401) {
    console.error(response);
    return { success: false };
  }
  return { accessToken: response.data.accessToken, success: true };
};

const RouteComponent = () => {
  const login = useAppStore((store) => store.login);
  const setupStateQuery = useSetupStateQuery();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const handleLogin = async (credentials: $LoginCredentials) => {
    const result = await loginRequest(credentials);
    if (!result.success) {
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
};

export const Route = createFileRoute('/auth/login')({
  beforeLoad: async () => {
    if (import.meta.env.DEV && import.meta.env.MODE !== 'test' && config.dev.isBypassAuthEnabled) {
      const { login } = useAppStore.getState();
      const response = await loginRequest({
        password: config.dev.password!,
        username: config.dev.username!
      });
      if (!response.success) {
        throw new Error('Login failed');
      }
      login(response.accessToken);
      throw redirect({
        to: '/dashboard'
      });
    }
  },
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(setupStateQueryOptions())
});
