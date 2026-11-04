import type { PropsWithChildren } from 'react';

import { CoreProvider } from '@douglasneuroinformatics/libui/providers';
import type { PermissionSetSummary } from '@opendatacapture/schemas/permission-set';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/permission-sets/index';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  deleteMutate: vi.fn(),
  navigate: vi.fn(),
  permissionSets: [] as PermissionSetSummary[],
  permissionSetsQueryOptions: vi.fn(() => ({ queryKey: ['permission-sets'] }))
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
vi.mock('@/hooks/useDeletePermissionSetMutation', () => ({
  useDeletePermissionSetMutation: () => ({ mutate: mocks.deleteMutate })
}));
vi.mock('@/hooks/usePermissionSetsQuery', () => ({
  permissionSetsQueryOptions: mocks.permissionSetsQueryOptions,
  usePermissionSetsQuery: () => ({ data: mocks.permissionSets })
}));

const permissionSetFixture = (overrides: Partial<PermissionSetSummary> = {}): PermissionSetSummary => ({
  createdAt: new Date('2026-01-01'),
  holderCount: 3,
  id: 'set-1',
  name: 'Research Assistant',
  rules: [
    { action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' },
    { action: 'read', scope: 'ALL_GROUPS', subject: 'Instrument' }
  ],
  updatedAt: new Date('2026-01-01'),
  ...overrides
});

const renderPage = (permissionSets: PermissionSetSummary[]) => {
  mocks.permissionSets = permissionSets;
  const Component = Route.options.component!;
  render(
    <CoreProvider>
      <Component />
    </CoreProvider>
  );
};

const rows = () => screen.getAllByTestId('data-table-row');

const cellTexts = (row: HTMLElement) => Array.from(row.children, (cell) => cell.textContent);

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
};

describe('Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('should prefetch the permission sets in the loader, so the table renders without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue([]);
    await runLoader(queryClient);
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['permission-sets'] });
  });

  it('should list each set with how many rules it has and how many users hold it', () => {
    renderPage([permissionSetFixture()]);
    expect(cellTexts(rows()[0]!).slice(0, 3)).toEqual(['Research Assistant', '2', '3']);
  });

  it('should clip a long name to one line with the full name on hover, so its row stays one line tall', () => {
    const name = 'Research Assistant With A Name Long Enough To Outgrow Its Column';
    renderPage([permissionSetFixture({ name })]);
    expect(within(rows()[0]!).getByTitle(name).className).toContain('whitespace-nowrap');
  });

  it('should highlight a clicked row without leaving the list, as the other admin tables do', () => {
    renderPage([permissionSetFixture()]);
    fireEvent.click(rows()[0]!);
    expect(rows()[0]!.querySelector('[data-row-selected="true"]')).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('should open a set when its row is double-clicked', () => {
    renderPage([permissionSetFixture()]);
    fireEvent.doubleClick(rows()[0]!);
    expect(mocks.navigate).toHaveBeenCalledWith({
      params: { permissionSetId: 'set-1' },
      to: '/admin/permission-sets/$permissionSetId'
    });
  });

  describe('row actions', () => {
    const openRowAction = (label: string) => {
      fireEvent.keyDown(within(rows()[0]!).getByTestId('row-actions-trigger'), { key: 'Enter' });
      fireEvent.click(within(screen.getByTestId('row-actions-dropdown')).getByRole('menuitem', { name: label }));
    };

    it('should open a set from its manage action', () => {
      renderPage([permissionSetFixture()]);
      openRowAction('Manage');
      expect(mocks.navigate).toHaveBeenCalledWith({
        params: { permissionSetId: 'set-1' },
        to: '/admin/permission-sets/$permissionSetId'
      });
    });

    it('should confirm a delete from its row action, naming how many users hold the set', () => {
      renderPage([permissionSetFixture()]);
      openRowAction('Delete');
      const confirmation = screen.getByTestId('destructive-action-dialog');
      expect(confirmation.textContent).toContain('3 users hold this permission set');
      fireEvent.click(within(confirmation).getByRole('button', { name: 'Yes' }));
      expect(mocks.deleteMutate).toHaveBeenCalledWith({ id: 'set-1' }, { onSuccess: undefined });
    });
  });

  it('should link to adding a set', () => {
    renderPage([]);
    expect(screen.getByTestId('create-permission-set').getAttribute('href')).toBe('/admin/permission-sets/create');
  });

  it('should explain what a permission set is while none exists', () => {
    renderPage([]);
    expect(screen.getByTestId('data-table-empty-state').textContent).toContain('No permission sets yet');
  });
});
