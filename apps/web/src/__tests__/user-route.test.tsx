import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { User } from '@opendatacapture/schemas/user';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/user';

import '@/services/i18n';

type ProfileData = Partial<
  Pick<User, 'basePermissionLevel' | 'dateOfBirth' | 'email' | 'firstName' | 'lastName' | 'phoneNumber' | 'sex'>
>;

type MutateOptions = { onSuccess: () => void };

const STRONG_PASSWORD = 'Correct-Horse-Battery-Staple-42';

const mocks = vi.hoisted(() => ({
  currentUser: { id: 'user-1', username: 'jdoe' },
  mutate: vi.fn(),
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
    return { data: mocks.userData, dataUpdatedAt: 0 };
  }
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

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

const inputValue = (label: string) => screen.getByLabelText<HTMLInputElement>(label).value;

const openPasswordDialog = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
  return screen.getByRole('dialog');
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
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('should reject a confirmation that does not match the password', async () => {
    renderPage();
    submitPasswords(openPasswordDialog(), STRONG_PASSWORD, `${STRONG_PASSWORD}!`);
    expect(await screen.findByText('Passwords Must Match')).toBeTruthy();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('should send only the new password and close the dialog once the update succeeds', async () => {
    renderPage();
    submitPasswords(openPasswordDialog(), STRONG_PASSWORD, STRONG_PASSWORD);
    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith(
        { data: { password: STRONG_PASSWORD }, id: 'user-1' },
        { onSuccess: expect.any(Function) }
      );
    });
    const [, options] = mocks.mutate.mock.calls[0] as [unknown, MutateOptions];
    act(() => options.onSuccess());
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
