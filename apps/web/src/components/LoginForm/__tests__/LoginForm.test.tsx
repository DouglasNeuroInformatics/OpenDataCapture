import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from '../LoginForm';

import '@/services/i18n';

const fillAndSubmit = (credentials: { password: string; username: string }) => {
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: credentials.username } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: credentials.password } });
  fireEvent.click(screen.getByText('Login'));
};

describe('LoginForm', () => {
  afterEach(cleanup);

  it('should submit the entered credentials, so the caller can authenticate them', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fillAndSubmit({ password: 'secret', username: 'alice' });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ password: 'secret', username: 'alice' }));
  });

  it('should not submit when the password is empty, so a blank login never reaches the server', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fillAndSubmit({ password: '', username: 'alice' });
    const passwordGroup = screen.getByTestId('login-form').querySelector<HTMLElement>('[data-field-group="password"]')!;
    expect(await within(passwordGroup).findByTestId('error-message-text')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
