import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { UpdateMailConfigData } from '@opendatacapture/schemas/mail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TestMailSection } from '../TestMailSection';

import type { TestMailSectionProps } from '../TestMailSection';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('axios', () => ({ default: { post: mocks.post } }));

const config: UpdateMailConfigData = {
  enabled: true,
  encryption: 'starttls',
  host: 'smtp.example.org',
  port: 587,
  senderAddress: 'noreply@example.org',
  username: 'mailer'
};

const validConfig: TestMailSectionProps['buildConfig'] = () => ({ payload: config });

const renderSection = (buildConfig = validConfig) => {
  const onInvalid = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <TestMailSection buildConfig={buildConfig} onInvalid={onInvalid} />
    </QueryClientProvider>
  );
  return { onInvalid };
};

const connectionButton = () => screen.getByTestId('mail-test-connection');
const sendButton = () => screen.getByTestId('mail-send-test');
const enterRecipient = (value: string) => {
  fireEvent.change(screen.getByTestId('mail-test-recipient'), { target: { value } });
};
const lastNotification = () => useNotificationsStore.getState().notifications.at(-1);

const deferResponse = () => {
  let resolve: (value: { data: unknown }) => void = () => undefined;
  mocks.post.mockReturnValue(new Promise((done) => (resolve = done)));
  return (data: unknown) => resolve({ data });
};

describe('TestMailSection', () => {
  beforeEach(() => {
    mocks.post.mockReset();
    mocks.post.mockResolvedValue({ data: { error: null, success: true } });
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(cleanup);

  it('should report the form errors instead of testing an invalid configuration', () => {
    const { onInvalid } = renderSection(() => ({ errors: { host: 'bad host' } }));
    fireEvent.click(connectionButton());
    expect(onInvalid).toHaveBeenCalledWith({ host: 'bad host' });
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('should test the unsaved configuration without a recipient when checking the connection', async () => {
    renderSection();
    fireEvent.click(connectionButton());
    await waitFor(() => expect(lastNotification()?.type).toBe('success'));
    expect(mocks.post).toHaveBeenCalledWith('/v1/mail/test', { config, recipient: undefined }, expect.anything());
    expect(lastNotification()?.message).toBe('Connected to the mail server successfully');
  });

  it('should keep the send button disabled until the recipient is a valid address', () => {
    renderSection();
    expect(sendButton().hasAttribute('disabled')).toBe(true);
    enterRecipient('not-an-email');
    expect(sendButton().hasAttribute('disabled')).toBe(true);
    enterRecipient('admin@example.org');
    expect(sendButton().hasAttribute('disabled')).toBe(false);
  });

  it('should send a test email to the recipient and confirm where it went', async () => {
    renderSection();
    enterRecipient('admin@example.org');
    fireEvent.click(sendButton());
    await waitFor(() => expect(lastNotification()?.type).toBe('success'));
    expect(mocks.post).toHaveBeenCalledWith(
      '/v1/mail/test',
      { config, recipient: 'admin@example.org' },
      expect.anything()
    );
    expect(lastNotification()?.message).toBe('Test email sent to admin@example.org');
  });

  it('should explain a failed test using the error code the server returned', async () => {
    mocks.post.mockResolvedValue({ data: { error: 'AUTHENTICATION_FAILED', success: false } });
    renderSection();
    fireEvent.click(connectionButton());
    await waitFor(() => expect(lastNotification()?.type).toBe('error'));
    expect(lastNotification()?.message).toBe('Authentication failed — check the username and password.');
  });

  it('should show a generic failure when the request itself fails, such as on a timeout', async () => {
    mocks.post.mockRejectedValue(new Error('timeout'));
    renderSection();
    fireEvent.click(connectionButton());
    await waitFor(() => expect(lastNotification()?.type).toBe('error'));
    expect(lastNotification()?.title).toBe('Mail test failed');
    expect(lastNotification()?.message).toMatch(/^The test could not be completed/);
  });

  it('should show progress on the connection button and lock both tests while it runs', async () => {
    const respond = deferResponse();
    renderSection();
    enterRecipient('admin@example.org');
    fireEvent.click(connectionButton());
    await waitFor(() => expect(connectionButton().textContent).toBe('Testing…'));
    expect(sendButton().hasAttribute('disabled')).toBe(true);
    respond({ error: null, success: true });
    await waitFor(() => expect(connectionButton().textContent).toBe('Test connection'));
  });

  it('should show progress on the send button while a test email is being sent', async () => {
    const respond = deferResponse();
    renderSection();
    enterRecipient('admin@example.org');
    fireEvent.click(sendButton());
    await waitFor(() => expect(sendButton().textContent).toBe('Sending…'));
    expect(connectionButton().hasAttribute('disabled')).toBe(true);
    respond({ error: null, success: true });
    await waitFor(() => expect(sendButton().textContent).toBe('Send test email'));
  });
});
