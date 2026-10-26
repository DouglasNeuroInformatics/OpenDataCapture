import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { User } from '@opendatacapture/schemas/user';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/user';

import '@/services/i18n';

type ProfileData = Partial<
  Pick<User, 'basePermissionLevel' | 'dateOfBirth' | 'email' | 'firstName' | 'lastName' | 'phoneNumber' | 'sex'>
>;

type PasswordMutateOptions = { onError: (err: unknown) => void; onSuccess: () => void };

const STRONG_PASSWORD = 'Correct-Horse-Battery-Staple-42';

const mocks = vi.hoisted(() => ({
  currentUser: { id: 'user-1', username: 'jdoe' },
  dataUpdatedAt: 0,
  mutate: vi.fn(),
  resetPassword: vi.fn<(variables: unknown, options: PasswordMutateOptions) => void>(),
  useFindUserQuery: vi.fn(),
  userData: {}
}));

vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { currentUser: typeof mocks.currentUser }) => unknown) =>
    selector({ currentUser: mocks.currentUser })
}));
vi.mock('@/hooks/useFindUserQuery', () => ({
  useFindUserQuery: (id: string) => {
    mocks.useFindUserQuery(id);
    return { data: mocks.userData, dataUpdatedAt: mocks.dataUpdatedAt };
  }
}));
vi.mock('@/hooks/useResetPasswordMutation', () => ({
  useResetPasswordMutation: () => ({ mutate: mocks.resetPassword })
}));
vi.mock('@/hooks/useSelfUpdateUserMutation', () => ({
  useSelfUpdateUserMutation: () => ({ mutate: mocks.mutate })
}));

const FULL_PROFILE: ProfileData = {
  basePermissionLevel: 'GROUP_MANAGER',
  email: 'jane@example.org',
  firstName: 'Jane',
  lastName: 'Doe',
  phoneNumber: '514-555-0100',
  sex: 'FEMALE'
};

const Component = Route.options.component!;

const renderPage = () => render(<Component />);

const inputValue = (label: string) => screen.getByLabelText<HTMLInputElement>(label).value;

const openPasswordDialog = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
  return screen.getByRole('dialog');
};

const passwordRejection = (code: string) => {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    config,
    data: { code },
    headers: {},
    status: 400,
    statusText: ''
  });
};

const submitPasswords = (dialog: HTMLElement, password: string, confirmPassword: string) => {
  fireEvent.change(within(dialog).getByLabelText('Password'), { target: { value: password } });
  fireEvent.change(within(dialog).getByLabelText('Confirm Password'), { target: { value: confirmPassword } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
};

describe('user account page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('en');
    mocks.dataUpdatedAt = 0;
    useNotificationsStore.setState({ notifications: [] });
    mocks.userData = FULL_PROFILE;
  });

  afterEach(cleanup);

  it('should load the profile of the signed-in user', () => {
    renderPage();
    expect(mocks.useFindUserQuery).toHaveBeenCalledWith('user-1');
    expect(screen.getByTestId('user-info-username').textContent).toBe('jdoe');
  });

  it.each([
    ['ADMIN', 'Admin'],
    ['GROUP_MANAGER', 'Group Manager'],
    ['STANDARD', 'Standard User']
  ] as const)('should label the %s permission level as %s', (basePermissionLevel, label) => {
    mocks.userData = { ...FULL_PROFILE, basePermissionLevel };
    renderPage();
    expect(screen.getByTestId('user-info-role').textContent).toBe(`Role: ${label}`);
  });

  it('should omit the role of a user who has no base permission level', () => {
    mocks.userData = { ...FULL_PROFILE, basePermissionLevel: null };
    renderPage();
    expect(screen.queryByTestId('user-info-role')).toBeNull();
  });

  it('should prefill the profile form with the stored profile', () => {
    renderPage();
    expect(inputValue('First Name')).toBe('Jane');
    expect(inputValue('Last Name')).toBe('Doe');
    expect(inputValue('Email')).toBe('jane@example.org');
    expect(inputValue('Phone Number')).toBe('514-555-0100');
  });

  it('should prefill blank fields for a profile with nothing stored', () => {
    mocks.userData = { dateOfBirth: null, email: null, phoneNumber: null, sex: null };
    renderPage();
    expect(inputValue('First Name')).toBe('');
    expect(inputValue('Last Name')).toBe('');
    expect(inputValue('Email')).toBe('');
    expect(inputValue('Phone Number')).toBe('');
  });

  it('should leave an unchanged phone number out of the update, so a number stored before the digit minimum is not re-validated', async () => {
    mocks.userData = { ...FULL_PROFILE, phoneNumber: '555-01' };
    renderPage();
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Janet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'jane@example.org', firstName: 'Janet', phoneNumber: undefined }),
        id: 'user-1'
      });
    });
  });

  it('should clear an email the user blanked out and send a changed phone number', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '514-555-0199' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: null, phoneNumber: '514-555-0199' }),
        id: 'user-1'
      });
    });
  });

  it('should reject a weak password without sending it', async () => {
    renderPage();
    submitPasswords(openPasswordDialog(), 'abc', 'abc');
    expect(await screen.findByText('Insufficient password strength')).toBeTruthy();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it('should reject a confirmation that does not match the password', async () => {
    renderPage();
    submitPasswords(openPasswordDialog(), STRONG_PASSWORD, `${STRONG_PASSWORD}!`);
    expect(await screen.findByText('Passwords Must Match')).toBeTruthy();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it('should send only the new password and close the dialog once the update succeeds', async () => {
    renderPage();
    submitPasswords(openPasswordDialog(), STRONG_PASSWORD, STRONG_PASSWORD);
    await waitFor(() => {
      expect(mocks.resetPassword).toHaveBeenCalledWith({ id: 'user-1', password: STRONG_PASSWORD }, expect.anything());
    });
    const [, options] = mocks.resetPassword.mock.lastCall!;
    act(() => options.onSuccess());
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(useNotificationsStore.getState().notifications[0]).toMatchObject({ type: 'success' });
  });

  it.each([
    [
      'explain a password the server rejects',
      passwordRejection('PASSWORD_MATCHES_CURRENT'),
      'Password must not be the same as your current password'
    ],
    [
      'fall back to a generic message for any other failure',
      new AxiosError('Network Error', 'ERR_NETWORK'),
      'Failed to change password'
    ]
  ])('should keep the dialog open and %s', async (_, err, message) => {
    renderPage();
    submitPasswords(openPasswordDialog(), STRONG_PASSWORD, STRONG_PASSWORD);
    await waitFor(() => expect(mocks.resetPassword).toHaveBeenCalled());
    const [, options] = mocks.resetPassword.mock.lastCall!;
    act(() => options.onError(err));
    expect(useNotificationsStore.getState().notifications[0]).toMatchObject({ message, type: 'error' });
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('should keep unsaved profile edits when the user query refetches unchanged data', () => {
    const { rerender } = renderPage();
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Janet' } });
    mocks.dataUpdatedAt = 1;
    rerender(<Component />);
    expect(inputValue('First Name')).toBe('Janet');
  });

  it('should keep the saved values in the profile form when a save leaves the stored profile unchanged', async () => {
    const { rerender } = renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalled();
    });
    mocks.dataUpdatedAt = 1;
    rerender(<Component />);
    expect(inputValue('First Name')).toBe('Jane');
    expect(inputValue('Email')).toBe('jane@example.org');
  });

  it('should reseed the profile form once the stored profile changes, so a save shows the saved values', () => {
    const { rerender } = renderPage();
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Unsaved' } });
    mocks.userData = { ...FULL_PROFILE, firstName: 'Janet' };
    rerender(<Component />);
    expect(inputValue('First Name')).toBe('Janet');
    expect(inputValue('Last Name')).toBe('Doe');
  });
});
