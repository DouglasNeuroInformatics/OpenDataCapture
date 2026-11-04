import type { PropsWithChildren } from 'react';

import { CoreProvider } from '@douglasneuroinformatics/libui/providers';
import type { PermissionSetSummary } from '@opendatacapture/schemas/permission-set';
import { QueryClient } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/permission-sets/$permissionSetId';

import '@/services/i18n';

type MutateOptions = { onSuccess: () => void };

const mocks = vi.hoisted(() => ({
  deleteMutate: vi.fn<(variables: { id: string }, options: MutateOptions) => void>(),
  navigate: vi.fn(),
  permissionSet: null as unknown as PermissionSetSummary,
  permissionSetQueryOptions: vi.fn((id: string) => ({ queryKey: ['permission-sets', id] })),
  updateMutateAsync: vi.fn(),
  usePermissionSetQuery: vi.fn()
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children, to, ...props }: PropsWithChildren<{ 'data-testid'?: string; to: string }>) => (
    <a data-testid={props['data-testid']} href={to}>
      {children}
    </a>
  ),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/usePermissionSetQuery', () => ({
  permissionSetQueryOptions: mocks.permissionSetQueryOptions,
  usePermissionSetQuery: (id: string) => {
    mocks.usePermissionSetQuery(id);
    return { data: mocks.permissionSet };
  }
}));
vi.mock('@/hooks/useUpdatePermissionSetMutation', () => ({
  useUpdatePermissionSetMutation: () => ({ mutateAsync: mocks.updateMutateAsync })
}));
vi.mock('@/hooks/useDeletePermissionSetMutation', () => ({
  useDeletePermissionSetMutation: () => ({ mutate: mocks.deleteMutate })
}));

const permissionSetFixture = (overrides: Partial<PermissionSetSummary> = {}): PermissionSetSummary => ({
  createdAt: new Date('2026-01-01'),
  holderCount: 3,
  id: 'set-1',
  name: 'Research Assistant',
  rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }],
  updatedAt: new Date('2026-01-01'),
  ...overrides
});

const renderPage = () => {
  const Component = Route.options.component!;
  return render(
    <CoreProvider>
      <Component />
    </CoreProvider>
  );
};

const field = (name: string) => document.querySelector<HTMLInputElement>(`[name="${name}"]`)!;

const submit = () => fireEvent.click(screen.getByLabelText('Submit'));

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({
    context: { queryClient },
    params: { permissionSetId: 'set-1' }
  } as Parameters<typeof loader>[0]);
};

describe('Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Route, 'useParams').mockReturnValue({ permissionSetId: 'set-1' });
    mocks.permissionSet = permissionSetFixture();
    mocks.updateMutateAsync.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should prefetch the set in the loader, so the form renders without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue(undefined);
    await runLoader(queryClient);
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['permission-sets', 'set-1'] });
  });

  it('should load the set named in the url and fill the form from it', () => {
    renderPage();
    expect(mocks.usePermissionSetQuery).toHaveBeenCalledWith('set-1');
    expect(field('name').value).toBe('Research Assistant');
    expect(screen.getAllByTestId('permission-set-rule-row')).toHaveLength(1);
  });

  it('should link back to the list, so an admin can leave without saving or deleting', () => {
    renderPage();
    expect(screen.getByTestId('admin-permission-set-back').getAttribute('href')).toBe('/admin/permission-sets');
  });

  describe('saving', () => {
    it('should save the edited name and rules against the set', async () => {
      renderPage();
      fireEvent.change(field('name'), { target: { value: 'Renamed' } });
      submit();
      await waitFor(() => {
        expect(mocks.updateMutateAsync).toHaveBeenCalledWith({
          data: {
            name: 'Renamed',
            rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }]
          },
          id: 'set-1'
        });
      });
    });

    it('should say why a save failed and stay on the page', async () => {
      mocks.updateMutateAsync.mockRejectedValue(
        new AxiosError('Request failed with status code 409', 'ERR_BAD_REQUEST', undefined, undefined, {
          config: { headers: new AxiosHeaders() },
          data: { message: "Permission set with name 'Coordinator' already exists!" },
          headers: {},
          status: 409,
          statusText: 'Conflict'
        })
      );
      renderPage();
      submit();
      expect(await screen.findByText("Permission set with name 'Coordinator' already exists!")).toBeTruthy();
      expect(mocks.navigate).not.toHaveBeenCalled();
    });

    it('should fall back to a generic message when the failure carries no reason', async () => {
      mocks.updateMutateAsync.mockRejectedValue(new Error('Network Error'));
      renderPage();
      submit();
      expect(await screen.findByText('Failed to save permission set')).toBeTruthy();
    });
  });

  describe('deleting', () => {
    const confirmation = () => screen.getByTestId('destructive-action-dialog');

    it('should offer delete beside save, so the page needs no separate delete section', () => {
      renderPage();
      expect(screen.getByTestId('delete-permission-set').parentElement).toBe(
        screen.getByLabelText('Submit').parentElement
      );
    });

    it('should state who holds the set in the confirmation alone, not on the page', () => {
      renderPage();
      expect(document.body.textContent).not.toContain('3 users hold this permission set');
      fireEvent.click(screen.getByTestId('delete-permission-set'));
      expect(confirmation().textContent).toContain('3 users hold this permission set');
      expect(mocks.deleteMutate).not.toHaveBeenCalled();
      // libui queues confirmations in a module-level store, so one left open would greet the next test.
      fireEvent.click(within(confirmation()).getByRole('button', { name: 'No' }));
    });

    it('should delete the set once confirmed, then return to the list', async () => {
      renderPage();
      fireEvent.click(screen.getByTestId('delete-permission-set'));
      fireEvent.click(within(confirmation()).getByRole('button', { name: 'Yes' }));
      await waitFor(() => expect(mocks.deleteMutate).toHaveBeenCalledWith({ id: 'set-1' }, expect.anything()));
      expect(mocks.navigate).not.toHaveBeenCalled();
      act(() => mocks.deleteMutate.mock.lastCall![1].onSuccess());
      expect(mocks.navigate).toHaveBeenCalledWith({ to: '..' });
    });

    it('should leave the set alone when the admin declines', () => {
      renderPage();
      fireEvent.click(screen.getByTestId('delete-permission-set'));
      fireEvent.click(within(confirmation()).getByRole('button', { name: 'No' }));
      expect(mocks.deleteMutate).not.toHaveBeenCalled();
    });
  });
});
