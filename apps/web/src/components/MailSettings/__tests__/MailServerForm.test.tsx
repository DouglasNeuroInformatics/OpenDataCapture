import type { MailEncryption } from '@opendatacapture/schemas/mail';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MailServerForm } from '../MailServerForm';

import type { MailConfigFieldErrors, MailConfigFormValues, MailServerFormProps } from '../MailServerForm';

import '@/services/i18n';

const values: MailConfigFormValues = {
  enabled: true,
  encryption: 'starttls',
  host: 'smtp.example.org',
  password: '',
  port: '587',
  senderAddress: 'noreply@example.org',
  senderName: 'ODC',
  username: 'mailer'
};

const renderForm = (props: Partial<MailServerFormProps> = {}) => {
  const onChange = vi.fn();
  const onSave = vi.fn();
  render(
    <MailServerForm
      errors={{}}
      hasStoredPassword={false}
      isSaving={false}
      values={values}
      onChange={onChange}
      onSave={onSave}
      {...props}
    />
  );
  return { onChange, onSave };
};

const input = (testId: string) => screen.getByTestId<HTMLInputElement>(testId);
const saveButton = () => screen.getByTestId('mail-save-config');

describe('MailServerForm', () => {
  afterEach(cleanup);

  it('should show the current values in their fields', () => {
    renderForm();
    expect(input('mail-host').value).toBe('smtp.example.org');
    expect(input('mail-port').value).toBe('587');
    expect(input('mail-username').value).toBe('mailer');
    expect(input('mail-sender-name').value).toBe('ODC');
    expect(input('mail-sender-address').value).toBe('noreply@example.org');
  });

  it.each([
    ['mail-host', 'host', 'smtp.other.org'],
    ['mail-port', 'port', '2525'],
    ['mail-username', 'username', 'someone'],
    ['mail-password', 'password', 'hunter2'],
    ['mail-sender-name', 'senderName', 'Clinic'],
    ['mail-sender-address', 'senderAddress', 'clinic@example.org']
  ] as const)('should report an edit to %s as a change to %s', (testId, key, value) => {
    const { onChange } = renderForm();
    fireEvent.change(input(testId), { target: { value } });
    expect(onChange).toHaveBeenCalledWith(key, value);
  });

  it('should report the encryption mode the user picks', () => {
    const { onChange } = renderForm();
    fireEvent.keyDown(screen.getByTestId('mail-encryption'), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('option', { name: 'SSL/TLS' }), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('encryption', 'ssl');
  });

  it.each([
    ['none', '25'],
    ['ssl', '465'],
    ['starttls', '587']
  ] satisfies [MailEncryption, string][])(
    'should suggest the standard port for %s encryption, so the admin need not look it up',
    (encryption, port) => {
      renderForm({ values: { ...values, encryption, port: '' } });
      expect(input('mail-port').placeholder).toBe(port);
      expect(screen.getByText(`Suggested port for ${encryption.toUpperCase()}: ${port}`)).toBeTruthy();
    }
  );

  it('should explain that a stored password is masked, so the admin knows it need not be re-entered', () => {
    renderForm({ hasStoredPassword: true });
    expect(screen.getByText('A password is set (shown masked). Edit the field to replace it.')).toBeTruthy();
  });

  it('should not mention a stored password when there is none', () => {
    renderForm();
    expect(screen.queryByText('A password is set (shown masked). Edit the field to replace it.')).toBeNull();
  });

  it('should show each field error beneath its field', () => {
    const errors: MailConfigFieldErrors = {
      host: 'bad host',
      password: 'bad password',
      port: 'bad port',
      senderAddress: 'bad sender',
      username: 'bad username'
    };
    renderForm({ errors });
    expect(screen.getByTestId('mail-host-error').textContent).toBe('bad host');
    expect(screen.getByTestId('mail-port-error').textContent).toBe('bad port');
    expect(screen.getByTestId('mail-username-error').textContent).toBe('bad username');
    expect(screen.getByTestId('mail-password-error').textContent).toBe('bad password');
    expect(screen.getByTestId('mail-sender-address-error').textContent).toBe('bad sender');
  });

  it('should call save when the save button is clicked', () => {
    const { onSave } = renderForm();
    fireEvent.click(saveButton());
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('should disable the save button and show a spinner while saving, so a save cannot be sent twice', () => {
    renderForm({ isSaving: true });
    expect(saveButton().hasAttribute('disabled')).toBe(true);
    expect(saveButton().querySelector('svg')).not.toBeNull();
  });

  it('should not show a spinner when idle', () => {
    renderForm();
    expect(saveButton().querySelector('svg')).toBeNull();
  });
});
