import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/groups/create';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  navigate: vi.fn()
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useCreateGroupMutation', () => ({
  useCreateGroupMutation: () => ({ mutate: mocks.mutate })
}));

const CreateGroupPage = Route.options.component!;

const field = (name: string) => document.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;

const fillAndSubmit = ({ name, type }: { name: string; type: 'CLINICAL' | 'RESEARCH' }) => {
  render(<CreateGroupPage />);
  fireEvent.change(field('name'), { target: { value: name } });
  fireEvent.change(field('type'), { target: { value: type } });
  fireEvent.click(screen.getByLabelText('Submit'));
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('create group route', () => {
  it('should title the page as adding a group', () => {
    render(<CreateGroupPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Add Group' })).toBeTruthy();
  });

  it('should create the group with the entered name and chosen type', async () => {
    fillAndSubmit({ name: 'Depression Clinic', type: 'RESEARCH' });
    await waitFor(() =>
      expect(mocks.mutate).toHaveBeenCalledWith({ data: { name: 'Depression Clinic', type: 'RESEARCH' } })
    );
  });

  it('should return to the group list once the group is submitted', async () => {
    fillAndSubmit({ name: 'Psychosis Lab', type: 'CLINICAL' });
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' }));
  });

  it('should not create a group without a name, since the schema requires one', async () => {
    render(<CreateGroupPage />);
    fireEvent.change(field('type'), { target: { value: 'CLINICAL' } });
    fireEvent.click(screen.getByLabelText('Submit'));
    await waitFor(() => expect(screen.queryAllByTestId('error-message-text').length).toBeGreaterThan(0));
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
