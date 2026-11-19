import type { ComponentProps } from 'react';

import type { MailSettings as MailSettingsData } from '@opendatacapture/schemas/mail';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MailSettings } from '@/components/MailSettings';

import { MailTab } from '../MailTab';

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
  MailSettings: vi.fn((_: ComponentProps<typeof MailSettings>) => <div data-testid="mail-settings-form" />)
}));

vi.mock('@/components/MailSettings', () => ({ MailSettings: mocks.MailSettings }));
vi.mock('@/hooks/useMailSettingsQuery', () => ({ useMailSettingsQuery: () => ({ data: SETTINGS }) }));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { activeLanguages: ['en', 'fr'] } })
}));

describe('MailTab', () => {
  afterEach(cleanup);

  it('should hand the stored server config, welcome template and active languages to the mail settings form', () => {
    render(<MailTab />);
    expect(mocks.MailSettings.mock.lastCall?.[0]).toEqual({
      activeLanguages: ['en', 'fr'],
      config: SETTINGS.config,
      newUserEmailTemplate: SETTINGS.newUserEmailTemplate
    });
  });
});
