import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdateUserForm } from '../UpdateUserForm';

import type { UpdateUserFormInputData } from '../UpdateUserForm';

import '@/services/i18n';

const STRONG_PASSWORD = 'violet-harbor-quantum-lantern-58';

const onError = vi.fn();
const onSubmit = vi.fn();

const groupOptions = { 'group-1': 'Group One' };

const memberData: UpdateUserFormInputData = {
  groupOptions,
  initialValues: { email: 'jane@example.org', groupIds: new Set(['group-1']) },
  selectedUserBasePermission: 'STANDARD'
};

const renderForm = (data: UpdateUserFormInputData = memberData, hideSubmitButton?: boolean) => {
  const view = render(
    <UpdateUserForm data={data} hideSubmitButton={hideSubmitButton} onError={onError} onSubmit={onSubmit} />
  );
  return { form: screen.getByTestId('update-user-form'), view };
};

const field = (form: HTMLElement, name: string) => form.querySelector<HTMLInputElement>(`[name="${name}"]`)!;

const type = (form: HTMLElement, name: string, value: string) => {
  fireEvent.change(field(form, name), { target: { value } });
};

const submitButton = () => screen.getByLabelText('Submit');

const submit = () => fireEvent.click(submitButton());

const errorMessages = () => screen.queryAllByTestId('error-message-text').map((element) => element.textContent);

const submittedData = () => onSubmit.mock.lastCall?.[0];

const groupRequiredMessage = 'A user who is not an administrator must belong to at least one group';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('UpdateUserForm', () => {
  it('should start from the stored values, so an unchanged field is saved as it was', async () => {
    renderForm();
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedData()).toMatchObject({ email: 'jane@example.org', groupIds: new Set(['group-1']) });
  });

  it('should treat an account with no stored status as enabled', async () => {
    renderForm();
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedData().disabled).toBe(false);
  });

  it('should keep a disabled account disabled unless the status is changed', async () => {
    renderForm({ ...memberData, initialValues: { disabled: true, groupIds: new Set() } });
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedData().disabled).toBe(true);
  });

  it('should leave the forced reset untouched when no new password is set, so saving other changes does not lift it', async () => {
    renderForm();
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedData().mustResetPassword).toBeUndefined();
  });

  it('should not force a reset for a password the administrator typed themselves', async () => {
    const { form } = renderForm();
    type(form, 'password', STRONG_PASSWORD);
    type(form, 'confirmPassword', STRONG_PASSWORD);
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedData()).toMatchObject({ mustResetPassword: false, password: STRONG_PASSWORD });
  });

  it('should fill both password fields with a generated passphrase', () => {
    const { form } = renderForm();
    fireEvent.click(screen.getByLabelText('Generate Passphrase'));
    expect(field(form, 'password').value).not.toBe('');
    expect(field(form, 'confirmPassword').value).toBe(field(form, 'password').value);
  });

  it('should force a reset for a generated passphrase, so the user picks their own on next sign-in', async () => {
    renderForm();
    fireEvent.click(screen.getByLabelText('Generate Passphrase'));
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedData().mustResetPassword).toBe(true);
  });

  it('should reject a weak new password', async () => {
    const { form } = renderForm();
    type(form, 'password', 'password');
    type(form, 'confirmPassword', 'password');
    submit();
    await waitFor(() => expect(errorMessages()).toEqual(['Insufficient password strength']));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should reject a confirmation that does not match the new password', async () => {
    const { form } = renderForm();
    type(form, 'password', STRONG_PASSWORD);
    type(form, 'confirmPassword', `${STRONG_PASSWORD}x`);
    submit();
    await waitFor(() => expect(errorMessages()).toEqual(['Passwords Must Match']));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should report a refused submission to the caller, so it can explain why nothing was saved', async () => {
    const { form } = renderForm();
    type(form, 'password', 'password');
    submit();
    await waitFor(() => expect(onError).toHaveBeenCalled());
  });

  it('should require an enabled non-administrator to belong to a group', async () => {
    renderForm({ ...memberData, initialValues: { groupIds: new Set() } });
    submit();
    await waitFor(() => expect(errorMessages()).toEqual([groupRequiredMessage]));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should let an administrator belong to no group, since they can read every group anyway', async () => {
    renderForm({ ...memberData, initialValues: { groupIds: new Set() }, selectedUserBasePermission: 'ADMIN' });
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('should validate against the newly selected user, so a schema built for another permission level is not reused', async () => {
    const data: UpdateUserFormInputData = { ...memberData, initialValues: { groupIds: new Set() } };
    const { view } = renderForm({ ...data, selectedUserBasePermission: 'ADMIN' });
    view.rerender(<UpdateUserForm data={data} onError={onError} onSubmit={onSubmit} />);
    submit();
    await waitFor(() => expect(errorMessages()).toEqual([groupRequiredMessage]));
  });

  it('should render without stored values, defaulting the status to enabled', () => {
    renderForm({ groupOptions });
    expect(screen.getByLabelText<HTMLButtonElement>('Enabled').getAttribute('aria-checked')).toBe('true');
  });

  it('should accept a stored phone number as-is, so a number saved before the digit minimum does not block saving', async () => {
    renderForm({ ...memberData, initialValues: { groupIds: new Set(['group-1']), phoneNumber: '123' } });
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('should hide its own submit button when the caller submits it from elsewhere', () => {
    renderForm(memberData, true);
    expect([...submitButton().classList]).toContain('hidden');
  });

  it('should show its submit button by default', () => {
    renderForm();
    expect([...submitButton().classList]).not.toContain('hidden');
  });

  it("should mark its password fields as new passwords, so the browser does not fill in the administrator's own", () => {
    const { form } = renderForm();
    expect(field(form, 'password').getAttribute('autocomplete')).toBe('new-password');
  });
});
