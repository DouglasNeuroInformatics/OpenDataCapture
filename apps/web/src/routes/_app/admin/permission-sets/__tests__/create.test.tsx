import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/permission-sets/create';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  navigate: vi.fn()
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useCreatePermissionSetMutation', () => ({
  useCreatePermissionSetMutation: () => ({ mutateAsync: mocks.mutateAsync })
}));

const CreatePermissionSetPage = Route.options.component!;

const field = (name: string) => document.querySelector<HTMLInputElement>(`[name="${name}"]`)!;

const fillAndSubmit = (name: string) => {
  render(<CreatePermissionSetPage />);
  fireEvent.change(field('name'), { target: { value: name } });
  fireEvent.keyDown(screen.getByTestId('rule-action-select-trigger'), { key: 'Enter' });
  fireEvent.click(screen.getByTestId('rule-action-select-item-read'));
  fireEvent.keyDown(screen.getByTestId('rule-subject-select-trigger'), { key: 'Enter' });
  fireEvent.click(screen.getByTestId('rule-subject-select-item-Subject'));
  fireEvent.click(screen.getByLabelText('Submit'));
};

const conflict = (message: string) => {
  return new AxiosError('Request failed with status code 409', 'ERR_BAD_REQUEST', undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data: { message },
    headers: {},
    status: 409,
    statusText: 'Conflict'
  });
};

describe('Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutateAsync.mockResolvedValue({ data: {} });
  });

  afterEach(cleanup);

  it('should title the page as adding a permission set', () => {
    render(<CreatePermissionSetPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Add Permission Set' })).toBeTruthy();
  });

  it('should create the set with its name and rules', async () => {
    fillAndSubmit('Research Assistant');
    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        data: {
          name: 'Research Assistant',
          rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }]
        }
      });
    });
  });

  it('should return to the list once the set is created', async () => {
    fillAndSubmit('Research Assistant');
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' }));
  });

  it('should stay on the form and say why when the name is taken', async () => {
    mocks.mutateAsync.mockRejectedValue(conflict("Permission set with name 'Research Assistant' already exists!"));
    fillAndSubmit('Research Assistant');
    expect(await screen.findByText("Permission set with name 'Research Assistant' already exists!")).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(field('name').value).toBe('Research Assistant');
  });

  it('should fall back to a generic message when the failure carries no reason', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('Network Error'));
    fillAndSubmit('Research Assistant');
    expect(await screen.findByText('Failed to create permission set')).toBeTruthy();
  });
});
