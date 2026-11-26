import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LoginResult } from '@/hooks/useLoginMutation';
import type { AuthSlice } from '@/store/types';

import { ReauthenticationDialog } from '../ReauthenticationDialog';

import '@/services/i18n';

type StoreFixture = {
  currentUser: null | { username: string };
  isReauthenticationRequired: boolean;
  logout: () => void;
  reauthenticate: AuthSlice['reauthenticate'];
};

const mocks = vi.hoisted(() => ({
  isTransientError: vi.fn<(error: unknown) => boolean>(),
  logout: vi.fn(),
  mutateAsync: vi.fn<(credentials: { password: string; username: string }) => Promise<LoginResult>>(),
  reauthenticate: vi.fn<AuthSlice['reauthenticate']>(),
  store: { currentUser: { username: 'jdoe' }, isReauthenticationRequired: true } as Pick<
    StoreFixture,
    'currentUser' | 'isReauthenticationRequired'
  >,
  useLoginMutation: vi.fn()
}));

vi.mock('@/hooks/useLoginMutation', () => ({
  useLoginMutation: (options: unknown) => {
    mocks.useLoginMutation(options);
    return { mutateAsync: mocks.mutateAsync };
  }
}));
vi.mock('@/services/axios', () => ({ isTransientError: mocks.isTransientError }));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: StoreFixture) => unknown) => {
    return selector({ ...mocks.store, logout: mocks.logout, reauthenticate: mocks.reauthenticate });
  }
}));

const submitPassword = (password: string) => {
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
};

describe('ReauthenticationDialog', () => {
  beforeEach(() => {
    mocks.store.currentUser = { username: 'jdoe' };
    mocks.store.isReauthenticationRequired = true;
    mocks.mutateAsync.mockResolvedValue({ accessToken: 'fresh-token', kind: 'success' });
    mocks.reauthenticate.mockReturnValue('accepted');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should stay closed while the access token is good', () => {
    mocks.store.isReauthenticationRequired = false;
    render(<ReauthenticationDialog />);
    expect(screen.queryByTestId('reauthentication-dialog')).toBeNull();
  });

  it('should render nothing while nobody is signed in', () => {
    mocks.store.currentUser = null;
    render(<ReauthenticationDialog />);
    expect(screen.queryByTestId('reauthentication-dialog')).toBeNull();
  });

  it('should name the account the password is for', () => {
    render(<ReauthenticationDialog />);
    expect(screen.getByTestId('reauthentication-username').textContent).toBe('jdoe');
  });

  it("should sign in as the tab's own user, so nobody else can take over their work", async () => {
    render(<ReauthenticationDialog />);
    submitPassword('secret');
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledWith({ password: 'secret', username: 'jdoe' }));
  });

  it('should hand the new token to the store, which lets the held requests through', async () => {
    render(<ReauthenticationDialog />);
    submitPassword('secret');
    await waitFor(() => expect(mocks.reauthenticate).toHaveBeenCalledWith('fresh-token'));
    expect(screen.queryByTestId('reauthentication-refusal')).toBeNull();
  });

  it('should say the password was wrong and let the user try again', async () => {
    mocks.mutateAsync.mockResolvedValue({ kind: 'unauthorized' });
    render(<ReauthenticationDialog />);
    submitPassword('wrong');
    expect(await screen.findByText('Invalid login credentials')).toBeTruthy();
    expect(screen.getByTestId('reauthentication-form')).toBeTruthy();
    expect(mocks.reauthenticate).not.toHaveBeenCalled();
  });

  it('should say the server could not be reached when the request never got an answer, and let the user try again', async () => {
    mocks.isTransientError.mockReturnValue(true);
    mocks.mutateAsync.mockRejectedValue(new Error('Network Error'));
    render(<ReauthenticationDialog />);
    submitPassword('secret');
    expect(await screen.findByText(/Could not reach the server/)).toBeTruthy();
    expect(screen.getByTestId('reauthentication-form')).toBeTruthy();
  });

  it('should not blame the connection when the server answered with a failure, such as a throttled sign-in', async () => {
    mocks.isTransientError.mockReturnValue(false);
    mocks.mutateAsync.mockRejectedValue(new Error('Request failed with status code 429'));
    render(<ReauthenticationDialog />);
    submitPassword('secret');
    expect(await screen.findByText(/Sign-in failed/)).toBeTruthy();
    expect(screen.queryByText(/Could not reach the server/)).toBeNull();
  });

  it('should explain a failed request itself, so the user is not shown a second notification for it', () => {
    render(<ReauthenticationDialog />);
    expect(mocks.useLoginMutation).toHaveBeenCalledWith({ disableDefaultErrorNotification: true });
  });

  it.each([
    ['archived', /has been archived/],
    ['disabled', /account is disabled/],
    ['forbidden', /Sign-in failed/]
  ] as const)(
    'should keep the form for a sign-in that is %s, so the user can try again once an administrator has put it right',
    async (kind, message) => {
      mocks.mutateAsync.mockResolvedValue({ kind });
      render(<ReauthenticationDialog />);
      submitPassword('secret');
      expect(await screen.findByText(message)).toBeTruthy();
      expect(screen.getByTestId('reauthentication-form')).toBeTruthy();
      expect(mocks.reauthenticate).not.toHaveBeenCalled();
    }
  );

  it('should start with the form again the next time it opens, whatever it showed before', async () => {
    mocks.reauthenticate.mockReturnValue('differentUser');
    const { rerender } = render(<ReauthenticationDialog />);
    submitPassword('secret');
    await screen.findByTestId('reauthentication-refusal');
    mocks.store.isReauthenticationRequired = false;
    rerender(<ReauthenticationDialog />);
    await waitFor(() => expect(screen.queryByTestId('reauthentication-dialog')).toBeNull());
    mocks.store.isReauthenticationRequired = true;
    rerender(<ReauthenticationDialog />);
    expect(await screen.findByTestId('reauthentication-form')).toBeTruthy();
    expect(screen.queryByTestId('reauthentication-refusal')).toBeNull();
  });

  it.each([
    ['differentUser', /could not be confirmed as yours/],
    ['mustResetPassword', /password must be changed/]
  ] as const)('should leave only sign out when the store refuses the token (%s)', async (outcome, message) => {
    mocks.reauthenticate.mockReturnValue(outcome);
    render(<ReauthenticationDialog />);
    submitPassword('secret');
    expect((await screen.findByTestId('reauthentication-refusal')).textContent).toMatch(message);
    expect(screen.queryByTestId('reauthentication-form')).toBeNull();
  });

  it('should let the user sign out instead', () => {
    render(<ReauthenticationDialog />);
    fireEvent.click(screen.getByTestId('reauthentication-sign-out'));
    expect(mocks.logout).toHaveBeenCalledOnce();
  });
});
