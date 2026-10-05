import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { isRedirect } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/auth/reset-password';

import '@/services/i18n';

type MutationCallbacks = { onError: (err: unknown) => void; onSuccess: () => void };

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  mutate: vi.fn(),
  state: {
    accessToken: 'token-123',
    currentUser: { id: 'user-1', mustResetPassword: true, username: 'Zebra-Quantum-Lantern-42' }
  }
}));

vi.mock('@/hooks/useResetPasswordMutation', () => ({ useResetPasswordMutation: () => ({ mutate: mocks.mutate }) }));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  setupStateQueryOptions: () => ({ queryKey: ['setup-state'] }),
  useSetupStateQuery: () => ({ data: { activeLanguages: ['en'] } })
}));
vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (store: { logout: typeof mocks.logout } & typeof mocks.state) => unknown) =>
      selector({ ...mocks.state, logout: mocks.logout }),
    { getState: () => mocks.state }
  )
}));

const STRONG_PASSWORD = 'Velvet-Quasar-Orchard-Tundra-77';

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

const fillIn = (password: string, confirmPassword = password) => {
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: confirmPassword } });
};

const submit = () => fireEvent.submit(screen.getByTestId('reset-password-form'));

const respondWith = (outcome: (callbacks: MutationCallbacks) => void) =>
  mocks.mutate.mockImplementation((_: unknown, callbacks: MutationCallbacks) => outcome(callbacks));

/** Where the guard redirects to, or null when it lets the route load. */
const guardRedirect = () => {
  try {
    (Route.options.beforeLoad as () => void)();
  } catch (err) {
    if (isRedirect(err)) {
      return err.options.to;
    }
    throw err;
  }
  return null;
};

describe('reset password page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    useNotificationsStore.setState({ notifications: [] });
    mocks.state.accessToken = 'token-123';
    mocks.state.currentUser = { id: 'user-1', mustResetPassword: true, username: 'Zebra-Quantum-Lantern-42' };
  });

  afterEach(cleanup);

  describe('guard', () => {
    it('should send a visitor who is not signed in to the login page', () => {
      mocks.state.accessToken = null;
      expect(guardRedirect()).toBe('/auth/login');
    });

    it('should send a user who has no reset pending to the dashboard', () => {
      mocks.state.currentUser = { id: 'user-1', mustResetPassword: false, username: 'jane' };
      expect(guardRedirect()).toBe('/dashboard');
    });

    it('should send a token without a decoded user to the dashboard', () => {
      mocks.state.currentUser = null;
      expect(guardRedirect()).toBe('/dashboard');
    });

    it('should let a user who must reset their password through', () => {
      expect(guardRedirect()).toBeNull();
    });
  });

  it('should prefetch the setup state before rendering', async () => {
    const ensureQueryData = vi.fn().mockResolvedValue({});
    const loader = Route.options.loader as (opts: {
      context: { queryClient: { ensureQueryData: (options: unknown) => Promise<unknown> } };
    }) => Promise<unknown>;
    await loader({ context: { queryClient: { ensureQueryData } } });
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['setup-state'] });
  });

  it('should reject a weak password before it reaches the server', async () => {
    renderPage();
    fillIn('password');
    submit();
    expect(await screen.findByText('Insufficient password strength')).toBeTruthy();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('should reject a password that matches the username regardless of case', async () => {
    renderPage();
    fillIn('zebra-quantum-lantern-42');
    submit();
    expect(await screen.findByText('Password must not be the same as the username')).toBeTruthy();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('should reject a confirmation that differs from the password', async () => {
    renderPage();
    fillIn(STRONG_PASSWORD, `${STRONG_PASSWORD}!`);
    submit();
    expect(await screen.findByText('Passwords Must Match')).toBeTruthy();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('should show the strength of the password as it is typed', () => {
    const { container } = renderPage();
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: STRONG_PASSWORD } });
    expect(container.querySelector('.bg-green-500')).toBeTruthy();
  });

  it('should set the new password for the signed-in user', async () => {
    renderPage();
    fillIn(STRONG_PASSWORD);
    submit();
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalled());
    expect(mocks.mutate.mock.lastCall?.[0]).toEqual({ id: 'user-1', password: STRONG_PASSWORD });
  });

  it('should replace the form with a prompt to sign in again once the password is changed', async () => {
    respondWith(({ onSuccess }) => onSuccess());
    renderPage();
    fillIn(STRONG_PASSWORD);
    submit();
    expect(await screen.findByTestId('reset-password-success')).toBeTruthy();
    expect(screen.queryByTestId('reset-password-form')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();
  });

  it('should sign the user out when they choose to sign in again', async () => {
    respondWith(({ onSuccess }) => onSuccess());
    renderPage();
    fillIn(STRONG_PASSWORD);
    submit();
    fireEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it('should notify the user with a fallback message when the change fails', async () => {
    respondWith(({ onError }) => onError(new Error('Network Error')));
    renderPage();
    fillIn(STRONG_PASSWORD);
    submit();
    await waitFor(() => expect(useNotificationsStore.getState().notifications).toHaveLength(1));
    expect(useNotificationsStore.getState().notifications[0]).toMatchObject({
      message: 'Failed to change password',
      type: 'error'
    });
    expect(screen.getByTestId('reset-password-form')).toBeTruthy();
  });

  it('should let a user who does not want to choose a password now sign out', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(mocks.logout).toHaveBeenCalledOnce();
  });
});
