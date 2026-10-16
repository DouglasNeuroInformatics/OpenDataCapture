import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { DEFAULT_NEW_USER_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type { MailConfigDto, MailTemplate } from '@opendatacapture/schemas/mail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MailSettings } from '../MailSettings';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({ patch: vi.fn(), post: vi.fn() }));

vi.mock('axios', () => ({ default: { patch: mocks.patch, post: mocks.post } }));

const MASKED_SECRET = '••••••••';

const template: MailTemplate = {
  body: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.body, es: 'Hola {{username}}' },
  subject: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject, es: 'Su cuenta' }
};

const storedConfig: MailConfigDto = {
  enabled: true,
  encryption: 'starttls',
  hasPassword: true,
  host: 'smtp.example.org',
  port: 587,
  senderAddress: 'noreply@example.org',
  senderName: 'ODC',
  username: 'mailer'
};

const renderSettings = (config: MailConfigDto | null) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MailSettings config={config} newUserEmailTemplate={template} />
    </QueryClientProvider>
  );
};

const input = (testId: string) => screen.getByTestId<HTMLInputElement>(testId);
const type = (testId: string, value: string) => fireEvent.change(input(testId), { target: { value } });
const toggleEnabled = () => fireEvent.click(screen.getByTestId('mail-enabled-toggle'));
const saveConfig = () => fireEvent.click(screen.getByTestId('mail-save-config'));
const fieldError = (testId: string) => screen.queryByTestId(`${testId}-error`)?.textContent;
const lastNotification = () => useNotificationsStore.getState().notifications.at(-1);
const lastPatchBody = (): unknown => mocks.patch.mock.lastCall?.[1];

const fillNewServer = () => {
  type('mail-host', ' smtp.new.org ');
  type('mail-port', '465');
  type('mail-username', 'new-user');
  type('mail-password', 'hunter2');
  type('mail-sender-address', 'clinic@example.org');
};

describe('MailSettings', () => {
  beforeEach(() => {
    mocks.patch.mockReset();
    mocks.post.mockReset();
    mocks.patch.mockResolvedValue({ data: { config: storedConfig, newUserEmailTemplate: template } });
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(cleanup);

  describe('enabling', () => {
    it('should hide the server settings while email is off', () => {
      renderSettings(null);
      expect(screen.getByTestId('mail-enabled-toggle').getAttribute('aria-checked')).toBe('false');
      expect(screen.queryByTestId('mail-server-card')).toBeNull();
    });

    it('should reveal the settings without saving when email is first turned on', () => {
      renderSettings(null);
      toggleEnabled();
      expect(screen.getByTestId('mail-server-card')).toBeTruthy();
      expect(screen.getByTestId('mail-test-card')).toBeTruthy();
      expect(screen.getByTestId('mail-template-card')).toBeTruthy();
      expect(mocks.patch).not.toHaveBeenCalled();
    });

    it('should not save when email is turned back off before anything was configured', () => {
      renderSettings(null);
      toggleEnabled();
      toggleEnabled();
      expect(screen.queryByTestId('mail-server-card')).toBeNull();
      expect(mocks.patch).not.toHaveBeenCalled();
    });

    it('should persist a disable immediately, so the rest of the app stops offering email', async () => {
      renderSettings(storedConfig);
      toggleEnabled();
      await waitFor(() => expect(lastNotification()?.type).toBe('success'));
      expect(lastPatchBody()).toEqual({ config: { ...storedConfig, enabled: false } });
    });

    it('should send a missing sender name as absent rather than null when disabling', async () => {
      renderSettings({ ...storedConfig, senderName: null });
      toggleEnabled();
      await waitFor(() => expect(mocks.patch).toHaveBeenCalled());
      expect(lastPatchBody()).toEqual({ config: { ...storedConfig, enabled: false, senderName: undefined } });
    });
  });

  describe('initial values', () => {
    it('should prefill the form from the stored configuration', () => {
      renderSettings(storedConfig);
      expect(input('mail-host').value).toBe('smtp.example.org');
      expect(input('mail-port').value).toBe('587');
      expect(input('mail-username').value).toBe('mailer');
      expect(input('mail-sender-name').value).toBe('ODC');
      expect(input('mail-sender-address').value).toBe('noreply@example.org');
    });

    it('should show a stored password as a mask, since the secret never reaches the client', () => {
      renderSettings(storedConfig);
      expect(input('mail-password').value).toBe(MASKED_SECRET);
    });

    it('should leave the password empty when none is stored', () => {
      renderSettings({ ...storedConfig, hasPassword: false });
      expect(input('mail-password').value).toBe('');
    });

    it('should leave the port empty for a new configuration, so the suggested port shows', () => {
      renderSettings(null);
      toggleEnabled();
      expect(input('mail-port').value).toBe('');
    });
  });

  describe('saving the server', () => {
    it('should send the trimmed values with a numeric port and the new password', async () => {
      renderSettings(null);
      toggleEnabled();
      fillNewServer();
      saveConfig();
      await waitFor(() => expect(mocks.patch).toHaveBeenCalled());
      expect(lastPatchBody()).toEqual({
        config: {
          enabled: true,
          encryption: 'starttls',
          host: 'smtp.new.org',
          password: 'hunter2',
          port: 465,
          senderAddress: 'clinic@example.org',
          username: 'new-user'
        }
      });
    });

    it('should re-seed the form from what the server stored, so the saved password shows masked', async () => {
      renderSettings(null);
      toggleEnabled();
      fillNewServer();
      saveConfig();
      await waitFor(() => expect(lastNotification()?.type).toBe('success'));
      expect(input('mail-host').value).toBe('smtp.example.org');
      expect(input('mail-password').value).toBe(MASKED_SECRET);
    });

    it('should keep the stored password by omitting it when the mask is unchanged', async () => {
      renderSettings(storedConfig);
      saveConfig();
      await waitFor(() => expect(mocks.patch).toHaveBeenCalled());
      expect(lastPatchBody()).toEqual({
        config: {
          enabled: true,
          encryption: 'starttls',
          host: 'smtp.example.org',
          port: 587,
          senderAddress: 'noreply@example.org',
          senderName: 'ODC',
          username: 'mailer'
        }
      });
    });

    it('should flag every invalid field instead of saving', () => {
      renderSettings(null);
      toggleEnabled();
      saveConfig();
      expect(fieldError('mail-host')).toBe('Enter a valid host (e.g. smtp.example.org)');
      expect(fieldError('mail-port')).toBe('Port must be a whole number between 1 and 65535');
      expect(fieldError('mail-username')).toBe('A username is required');
      expect(fieldError('mail-sender-address')).toBe('Enter a valid sender address (e.g. noreply@example.org)');
      expect(fieldError('mail-password')).toBe('A password is required');
      expect(mocks.patch).not.toHaveBeenCalled();
    });

    it('should flag only the field that is invalid, so valid entries are not marked as errors', () => {
      renderSettings(null);
      toggleEnabled();
      fillNewServer();
      type('mail-sender-address', 'not-an-address');
      saveConfig();
      expect(fieldError('mail-sender-address')).toBe('Enter a valid sender address (e.g. noreply@example.org)');
      expect([fieldError('mail-host'), fieldError('mail-port'), fieldError('mail-username')]).toEqual([
        undefined,
        undefined,
        undefined
      ]);
      expect(mocks.patch).not.toHaveBeenCalled();
    });

    it('should require a password when none is stored, even if every other field is valid', () => {
      renderSettings({ ...storedConfig, hasPassword: false });
      saveConfig();
      expect(fieldError('mail-password')).toBe('A password is required');
      expect(mocks.patch).not.toHaveBeenCalled();
    });

    it('should ask for the password again when the server changes, since the stored one belongs to the old server', () => {
      renderSettings(storedConfig);
      type('mail-host', 'smtp.other.org');
      saveConfig();
      expect(fieldError('mail-password')).toBe('Re-enter the password for this mail server');
      expect(mocks.patch).not.toHaveBeenCalled();
    });

    it('should save a server change once a new password is entered', async () => {
      renderSettings(storedConfig);
      type('mail-host', 'smtp.other.org');
      type('mail-password', 'new-secret');
      saveConfig();
      await waitFor(() => expect(mocks.patch).toHaveBeenCalled());
      expect(lastPatchBody()).toMatchObject({ config: { host: 'smtp.other.org', password: 'new-secret' } });
    });

    it('should clear a field error as soon as that field is edited', () => {
      renderSettings(null);
      toggleEnabled();
      saveConfig();
      type('mail-host', 'smtp.new.org');
      expect(fieldError('mail-host')).toBeUndefined();
      expect(fieldError('mail-port')).toBe('Port must be a whole number between 1 and 65535');
    });

    it('should report a failed save and keep the unsaved edits', async () => {
      mocks.patch.mockRejectedValue(new Error('offline'));
      renderSettings(storedConfig);
      type('mail-sender-name', 'Clinic');
      saveConfig();
      await waitFor(() => expect(lastNotification()?.type).toBe('error'));
      expect(lastNotification()?.title).toBe('Save failed');
      expect(input('mail-sender-name').value).toBe('Clinic');
    });

    it('should disable the save button while a save is in flight', async () => {
      mocks.patch.mockReturnValue(new Promise(() => undefined));
      renderSettings(storedConfig);
      saveConfig();
      await waitFor(() => expect(screen.getByTestId('mail-save-config').hasAttribute('disabled')).toBe(true));
    });
  });

  describe('sections', () => {
    it('should show the form errors when a test is run against an invalid configuration', () => {
      renderSettings(null);
      toggleEnabled();
      fireEvent.click(screen.getByTestId('mail-test-connection'));
      expect(fieldError('mail-host')).toBe('Enter a valid host (e.g. smtp.example.org)');
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it('should save the new user template on its own', async () => {
      renderSettings(storedConfig);
      fireEvent.click(screen.getByTestId('mail-template-save'));
      await waitFor(() => expect(mocks.patch).toHaveBeenCalled());
      expect(lastPatchBody()).toEqual({ newUserEmailTemplate: template });
    });
  });
});
