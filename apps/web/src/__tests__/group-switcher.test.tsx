import type { PropsWithChildren } from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupSwitcher } from '@/components/GroupSwitcher';

import '@/services/i18n';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));
const store = vi.hoisted(() => ({
  changeGroup: vi.fn(),
  currentGroup: null as null | { id: string; name: string },
  currentUser: null as null | {
    ability: { can: (action: string, subject: string) => boolean };
    groups: { id: string; name: string }[];
  }
}));

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(store))
}));

const platformGroup = {
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  id: 'platform',
  instrumentRepoIds: [],
  name: 'Platform Group',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  userIds: []
};

const Wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const asUser = ({ groups, isAdmin }: { groups: { id: string; name: string }[]; isAdmin: boolean }) => ({
  ability: { can: (action: string, subject: string) => isAdmin && action === 'manage' && subject === 'all' },
  groups
});

describe('GroupSwitcher', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [platformGroup] });
  });

  afterEach(cleanup);

  it('should prompt an admin who belongs to no group to select one, so they can reach any group on the platform', async () => {
    store.currentGroup = null;
    store.currentUser = asUser({ groups: [], isAdmin: true });
    render(<GroupSwitcher />, { wrapper: Wrapper });
    expect((await screen.findByTestId('group-switcher')).textContent).toContain('Select a group');
  });

  it('should render nothing for a non-admin who belongs to no group, since there is nothing to switch to', () => {
    store.currentGroup = null;
    store.currentUser = asUser({ groups: [], isAdmin: false });
    render(<GroupSwitcher />, { wrapper: Wrapper });
    expect(screen.queryByTestId('group-switcher')).toBeNull();
  });

  it('should show the only group a non-admin belongs to as static text, since there is nothing to switch to', () => {
    const group = { id: 'own', name: 'Own Group' };
    store.currentGroup = group;
    store.currentUser = asUser({ groups: [group], isAdmin: false });
    render(<GroupSwitcher />, { wrapper: Wrapper });
    const switcher = screen.getByTestId('group-switcher');
    expect(switcher.tagName).toBe('DIV');
    expect(switcher.textContent).toContain('Own Group');
  });
});
