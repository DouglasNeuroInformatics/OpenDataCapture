import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/groups/create';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  navigate: vi.fn()
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useCreateGroupMutation', () => ({
  useCreateGroupMutation: () => ({ mutateAsync: mocks.mutateAsync })
}));

const CreateGroupPage = Route.options.component!;

const field = (name: string) => document.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;

const fillAndSubmit = ({ name, type }: { name: string; type: 'CLINICAL' | 'RESEARCH' }) => {
  render(<CreateGroupPage />);
  fireEvent.change(field('name'), { target: { value: name } });
  fireEvent.change(field('type'), { target: { value: type } });
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

  it('should title the page as adding a group', () => {
    render(<CreateGroupPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Add Group' })).toBeTruthy();
  });

  it('should create the group with the entered name and chosen type', async () => {
    fillAndSubmit({ name: 'Depression Clinic', type: 'RESEARCH' });
    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({ data: { name: 'Depression Clinic', type: 'RESEARCH' } });
    });
  });

  it('should return to the group list once the group is created', async () => {
    fillAndSubmit({ name: 'Psychosis Lab', type: 'CLINICAL' });
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' }));
  });

  it('should stay on the form when creating the group fails, so the entered name is not lost', async () => {
    mocks.mutateAsync.mockRejectedValue(conflict("Group with name 'Psychosis Lab' already exists!"));
    fillAndSubmit({ name: 'Psychosis Lab', type: 'CLINICAL' });
    expect(await screen.findByText("Group with name 'Psychosis Lab' already exists!")).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(field('name').value).toBe('Psychosis Lab');
  });

  it('should fall back to a generic message on the form when the failure carries no reason', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('Network Error'));
    fillAndSubmit({ name: 'Psychosis Lab', type: 'CLINICAL' });
    expect(await screen.findByText('Failed to create group')).toBeTruthy();
  });

  it('should not create a group without a name, since the schema requires one', async () => {
    render(<CreateGroupPage />);
    fireEvent.change(field('type'), { target: { value: 'CLINICAL' } });
    fireEvent.click(screen.getByLabelText('Submit'));
    await waitFor(() => expect(screen.queryAllByTestId('error-message-text').length).toBeGreaterThan(0));
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });
});
