import type { ComponentProps } from 'react';

import type { MailSettings as MailSettingsData } from '@opendatacapture/schemas/mail';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MailSettings } from '@/components/MailSettings';
import { Route } from '@/routes/_app/admin/mail';

import '@/services/i18n';

const SETTINGS: MailSettingsData = {
  config: {
    enabled: true,
    encryption: 'starttls',
    hasPassword: true,
    host: 'smtp.example.org',
    port: 587,
    senderAddress: 'noreply@example.org',
    senderName: 'Open Data Capture',
    username: 'mailer'
  },
  newUserEmailTemplate: { body: { en: 'Welcome, {{firstName}}.' }, subject: { en: 'Welcome' } }
};

const mocks = vi.hoisted(() => ({
  MailSettings: vi.fn((_: ComponentProps<typeof MailSettings>) => <div data-testid="mail-settings-form" />),
  mailSettingsQueryOptions: vi.fn(() => ({ queryKey: ['mail-settings'] }))
}));

vi.mock('@/components/MailSettings', () => ({ MailSettings: mocks.MailSettings }));
vi.mock('@/hooks/useMailSettingsQuery', () => ({
  mailSettingsQueryOptions: mocks.mailSettingsQueryOptions,
  useMailSettingsQuery: () => ({ data: SETTINGS })
}));

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
};

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('admin mail route', () => {
  it('should prefetch the mail settings in the loader, so the page renders without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue(SETTINGS);
    await runLoader(queryClient);
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['mail-settings'] });
  });

  it('should title the page as the mail server settings', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Mail Server' })).toBeTruthy();
  });

  it('should hand the stored server config and welcome template to the mail settings form', () => {
    renderPage();
    expect(screen.getByTestId('mail-settings-page').contains(screen.getByTestId('mail-settings-form'))).toBe(true);
    expect(mocks.MailSettings.mock.lastCall?.[0]).toEqual({
      config: SETTINGS.config,
      newUserEmailTemplate: SETTINGS.newUserEmailTemplate
    });
  });
});
