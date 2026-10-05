import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { EmailDeliveryResult } from '@opendatacapture/schemas/mail';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/users/create';

import '@/services/i18n';

const STRONG_PASSWORD = 'violet-harbor-quantum-lantern-58';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  groups: [] as { id: string; name: string }[],
  groupsQueryOptions: vi.fn(() => ({ queryKey: ['groups'] })),
  isMailEnabled: false,
  mutateAsync: vi.fn(),
  navigate: vi.fn()
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, default: { get: mocks.get } };
});
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useCreateUserMutation', () => ({
  useCreateUserMutation: () => ({ mutateAsync: mocks.mutateAsync })
}));
vi.mock('@/hooks/useGroupsQuery', () => ({
  groupsQueryOptions: mocks.groupsQueryOptions,
  useGroupsQuery: () => ({ data: mocks.groups })
}));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { isMailEnabled: mocks.isMailEnabled } })
}));

const welcomeEmail = (overrides: Partial<EmailDeliveryResult> = {}): EmailDeliveryResult => ({
  error: null,
  message: 'Welcome to Open Data Capture, jdoe.',
  recipient: 'jdoe@example.org',
  status: 'SENT',
  ...overrides
});

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
};

const renderPage = () => {
  const Component = Route.options.component!;
  render(<Component />);
  return screen.getByTestId('create-user-form');
};

const field = (form: HTMLElement, name: string) => form.querySelector<HTMLInputElement>(`[name="${name}"]`)!;

const type = (form: HTMLElement, name: string, value: string) => {
  fireEvent.change(field(form, name), { target: { value } });
};

const fillCredentials = (
  form: HTMLElement,
  { confirmPassword = STRONG_PASSWORD, password = STRONG_PASSWORD, username = 'jdoe' } = {}
) => {
  type(form, 'username', username);
  type(form, 'password', password);
  type(form, 'confirmPassword', confirmPassword);
  type(form, 'firstName', 'Jane');
  type(form, 'lastName', 'Doe');
};

const choosePermissionLevel = (form: HTMLElement, level: 'ADMIN' | 'GROUP_MANAGER' | 'STANDARD') => {
  fireEvent.change(field(form, 'basePermissionLevel'), { target: { value: level } });
};

const submit = () => fireEvent.click(screen.getByLabelText('Submit'));

const fillAndSubmit = (credentials: Parameters<typeof fillCredentials>[1] = {}) => {
  const form = renderPage();
  fillCredentials(form, credentials);
  choosePermissionLevel(form, 'ADMIN');
  submit();
  return form;
};

const notifications = () => useNotificationsStore.getState().notifications;

const lastNotification = () => notifications().at(-1);

const errorMessages = () => screen.queryAllByTestId('error-message-text').map((element) => element.textContent);

/** Gives the closing dialog an exit animation, so Radix keeps it mounted after its state clears. */
const animateDialogExit = () => {
  const style = document.createElement('style');
  style.textContent = '[role="dialog"][data-state="closed"] { animation-name: exit; }';
  document.head.append(style);
  onTestFinished(() => style.remove());
};

const stubClipboardWrite = () => {
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  onTestFinished(() => writeText.mockRestore());
  return writeText;
};

beforeEach(() => {
  vi.clearAllMocks();
  useNotificationsStore.setState({ notifications: [] });
  mocks.groups = [];
  mocks.isMailEnabled = false;
  mocks.get.mockResolvedValue({ data: { success: false } });
  mocks.mutateAsync.mockResolvedValue({ welcomeEmail: welcomeEmail({ status: 'DISABLED' }) });
});

afterEach(cleanup);

describe('create user route', () => {
  it('should prefetch the groups in the loader, so the group options render without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue([]);
    await runLoader(queryClient);
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['groups'] });
  });

  it('should escape the username in the existence check, so a slash cannot change the path', async () => {
    fillAndSubmit({ username: 'j/doe' });
    await waitFor(() => expect(mocks.get).toHaveBeenCalledWith('/v1/users/check-username/j%2Fdoe'));
  });

  it('should refuse a username that already exists without creating the user', async () => {
    mocks.get.mockResolvedValue({ data: { success: true } });
    fillAndSubmit();
    await waitFor(() =>
      expect(lastNotification()).toMatchObject({ message: 'Username already exists', type: 'error' })
    );
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it('should create the user with blank contact details omitted and no forced password reset', async () => {
    fillAndSubmit();
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalled());
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({
        basePermissionLevel: 'ADMIN',
        email: undefined,
        groupIds: [],
        mustResetPassword: false,
        password: STRONG_PASSWORD,
        phoneNumber: undefined,
        username: 'jdoe'
      }),
      language: 'en'
    });
  });

  it('should submit contact details that were filled in', async () => {
    const form = renderPage();
    fillCredentials(form);
    choosePermissionLevel(form, 'ADMIN');
    type(form, 'email', 'jdoe@example.org');
    submit();
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalled());
    expect(mocks.mutateAsync.mock.lastCall?.[0].data.email).toBe('jdoe@example.org');
  });

  it('should report a generic failure when the create request fails for a reason other than the password', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('Network Error'));
    fillAndSubmit();
    await waitFor(() => expect(lastNotification()).toMatchObject({ message: 'Failed to create user', type: 'error' }));
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('should explain a password the server rejected, so the admin knows to choose another', async () => {
    const headers = new AxiosHeaders();
    mocks.mutateAsync.mockRejectedValue(
      new AxiosError('Bad Request', '400', { headers }, null, {
        config: { headers },
        data: { code: 'PASSWORD_IN_DATA_BREACH' },
        headers: {},
        status: 400,
        statusText: 'Bad Request'
      })
    );
    fillAndSubmit();
    await waitFor(() =>
      expect(lastNotification()?.message).toBe('This password has appeared in a known data breach and cannot be used')
    );
  });

  it('should confirm the creation and return to the users list when mail is disabled', async () => {
    fillAndSubmit();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' }));
    expect(lastNotification()).toMatchObject({ type: 'success' });
  });

  it('should not offer a welcome email language when mail is disabled', () => {
    renderPage();
    expect(screen.queryByTestId('welcome-email-language')).toBeNull();
  });

  it('should confirm the creation without email details when the welcome email reports delivery as disabled', async () => {
    mocks.isMailEnabled = true;
    fillAndSubmit();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' }));
    expect(lastNotification()?.title).toBeUndefined();
  });

  it('should send the welcome email in the language the admin chose', async () => {
    mocks.isMailEnabled = true;
    const form = renderPage();
    fireEvent.keyDown(screen.getByTestId('welcome-email-language'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('option', { name: 'French' }));
    fillCredentials(form);
    choosePermissionLevel(form, 'ADMIN');
    submit();
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalled());
    expect(mocks.mutateAsync.mock.lastCall?.[0].language).toBe('fr');
  });

  it('should name the recipient of a welcome email that was sent', async () => {
    mocks.isMailEnabled = true;
    mocks.mutateAsync.mockResolvedValue({ welcomeEmail: welcomeEmail() });
    fillAndSubmit();
    await waitFor(() =>
      expect(lastNotification()).toMatchObject({
        message: 'A welcome email was sent to jdoe@example.org',
        title: 'Welcome email sent',
        type: 'success'
      })
    );
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' });
  });

  it('should still confirm a sent welcome email whose recipient the server did not echo', async () => {
    mocks.isMailEnabled = true;
    mocks.mutateAsync.mockResolvedValue({ welcomeEmail: welcomeEmail({ recipient: null }) });
    fillAndSubmit();
    await waitFor(() => expect(lastNotification()?.message).toBe('A welcome email was sent to '));
  });

  it('should explain why a welcome email failed', async () => {
    mocks.isMailEnabled = true;
    mocks.mutateAsync.mockResolvedValue({
      welcomeEmail: welcomeEmail({ error: 'HOST_NOT_FOUND', status: 'FAILED' })
    });
    fillAndSubmit();
    await waitFor(() =>
      expect(lastNotification()).toMatchObject({
        message: 'The mail server could not be found — check the host name.',
        title: 'Welcome email failed',
        type: 'error'
      })
    );
  });

  it('should show a failed welcome email for manual sending instead of leaving the page', async () => {
    mocks.isMailEnabled = true;
    mocks.mutateAsync.mockResolvedValue({ welcomeEmail: welcomeEmail({ status: 'FAILED' }) });
    fillAndSubmit();
    const dialog = await screen.findByTestId('welcome-email-fallback');
    expect(within(dialog).getByText('Welcome to Open Data Capture, jdoe.')).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('should show the welcome message without an error when the user has no email address', async () => {
    mocks.isMailEnabled = true;
    mocks.mutateAsync.mockResolvedValue({ welcomeEmail: welcomeEmail({ recipient: null, status: 'NO_RECIPIENT' }) });
    fillAndSubmit();
    await screen.findByTestId('welcome-email-fallback');
    expect(notifications()).toHaveLength(0);
  });

  it('should return to the users list once the admin is done with the welcome message', async () => {
    mocks.isMailEnabled = true;
    mocks.mutateAsync.mockResolvedValue({ welcomeEmail: welcomeEmail({ status: 'NO_RECIPIENT' }) });
    fillAndSubmit();
    fireEvent.click(await screen.findByRole('button', { name: 'Done' }));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' });
    expect(screen.queryByTestId('welcome-email-fallback')).toBeNull();
  });

  it('should return to the users list when the welcome message is dismissed', async () => {
    mocks.isMailEnabled = true;
    mocks.mutateAsync.mockResolvedValue({ welcomeEmail: welcomeEmail({ status: 'NO_RECIPIENT' }) });
    fillAndSubmit();
    fireEvent.keyDown(await screen.findByTestId('welcome-email-fallback'), { key: 'Escape' });
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' });
  });

  it('should not copy a stale welcome message while the dialog closes', async () => {
    animateDialogExit();
    const writeText = stubClipboardWrite();
    mocks.isMailEnabled = true;
    mocks.mutateAsync.mockResolvedValue({ welcomeEmail: welcomeEmail({ status: 'NO_RECIPIENT' }) });
    fillAndSubmit();
    const doneButton = await screen.findByRole('button', { name: 'Done' });
    const copyButton = doneButton.previousElementSibling!;
    fireEvent.click(doneButton);
    fireEvent.click(copyButton);
    expect(writeText).toHaveBeenCalledWith('');
  });

  it('should rate the strength of the password as it is typed', () => {
    const form = renderPage();
    type(form, 'password', STRONG_PASSWORD);
    expect(form.querySelector('.bg-green-500')).toBeTruthy();
  });

  it('should fill both password fields with a generated passphrase', () => {
    const form = renderPage();
    fireEvent.click(screen.getByLabelText('Generate Passphrase'));
    expect(field(form, 'password').value).not.toBe('');
    expect(field(form, 'confirmPassword').value).toBe(field(form, 'password').value);
  });

  it('should force a password reset for a user created with a generated passphrase', async () => {
    const form = renderPage();
    type(form, 'username', 'jdoe');
    type(form, 'firstName', 'Jane');
    type(form, 'lastName', 'Doe');
    fireEvent.click(screen.getByLabelText('Generate Passphrase'));
    choosePermissionLevel(form, 'ADMIN');
    submit();
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalled());
    expect(mocks.mutateAsync.mock.lastCall?.[0].data.mustResetPassword).toBe(true);
  });

  it('should reject a weak password before contacting the server', async () => {
    fillAndSubmit({ confirmPassword: 'password', password: 'password' });
    await waitFor(() => expect(errorMessages()).toContain('Insufficient password strength'));
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it('should reject a password that matches the username regardless of case', async () => {
    fillAndSubmit({ username: STRONG_PASSWORD.toUpperCase() });
    await waitFor(() => expect(errorMessages()).toContain('Password must not be the same as the username'));
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it('should reject a confirmation that does not match the password', async () => {
    fillAndSubmit({ confirmPassword: `${STRONG_PASSWORD}x` });
    await waitFor(() => expect(errorMessages()).toContain('Passwords Must Match'));
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it('should not offer groups until a permission level is chosen', () => {
    mocks.groups = [{ id: 'group-1', name: 'Group One' }];
    renderPage();
    expect(screen.queryByText('Group One')).toBeNull();
  });

  it('should not offer groups to an administrator, who is not confined to any', () => {
    mocks.groups = [{ id: 'group-1', name: 'Group One' }];
    const form = renderPage();
    choosePermissionLevel(form, 'ADMIN');
    expect(screen.queryByText('Group One')).toBeNull();
  });

  it('should offer every group to a user below administrator', () => {
    mocks.groups = [
      { id: 'group-1', name: 'Group One' },
      { id: 'group-2', name: 'Group Two' }
    ];
    const form = renderPage();
    choosePermissionLevel(form, 'STANDARD');
    expect(screen.getByLabelText('Group One')).toBeTruthy();
    expect(screen.getByLabelText('Group Two')).toBeTruthy();
  });

  it('should require a group for an enabled user below administrator', async () => {
    const form = renderPage();
    fillCredentials(form);
    choosePermissionLevel(form, 'STANDARD');
    submit();
    await waitFor(() =>
      expect(errorMessages()).toContain('A user who is not an administrator must belong to at least one group')
    );
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it('should require a group again once every chosen group is cleared', async () => {
    mocks.groups = [{ id: 'group-1', name: 'Group One' }];
    const form = renderPage();
    fillCredentials(form);
    choosePermissionLevel(form, 'STANDARD');
    fireEvent.click(screen.getByLabelText('Group One'));
    fireEvent.click(screen.getByLabelText('Group One'));
    submit();
    await waitFor(() =>
      expect(errorMessages()).toContain('A user who is not an administrator must belong to at least one group')
    );
  });

  it('should submit the groups chosen for a user below administrator', async () => {
    mocks.groups = [{ id: 'group-1', name: 'Group One' }];
    const form = renderPage();
    fillCredentials(form);
    choosePermissionLevel(form, 'STANDARD');
    fireEvent.click(screen.getByLabelText('Group One'));
    submit();
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalled());
    expect(mocks.mutateAsync.mock.lastCall?.[0].data.groupIds).toEqual(['group-1']);
  });
});
