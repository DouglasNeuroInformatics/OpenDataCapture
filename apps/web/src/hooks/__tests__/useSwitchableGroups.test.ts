import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSwitchableGroups } from '../useSwitchableGroups';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));
const store = vi.hoisted(() => ({
  currentUser: null as null | { ability: { can: (action: string, subject: string) => boolean }; groups: unknown[] }
}));

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(store))
}));

const createGroup = (id: string) => ({
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  id,
  instrumentRepoIds: [],
  name: `Group ${id}`,
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  userIds: []
});

const ownGroup = createGroup('own');
const otherGroup = createGroup('other');

const asUser = ({ isAdmin }: { isAdmin: boolean }) => ({
  ability: { can: (action: string, subject: string) => isAdmin && action === 'manage' && subject === 'all' },
  groups: [ownGroup]
});

function renderSwitchableGroups() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useSwitchableGroups(), { wrapper });
}

describe('useSwitchableGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [ownGroup, otherGroup] });
  });

  it('should offer an admin every group on the platform, so they can act in groups they do not belong to', async () => {
    store.currentUser = asUser({ isAdmin: true });
    const { result } = renderSwitchableGroups();
    await waitFor(() => expect(result.current).toEqual([ownGroup, otherGroup]));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/groups');
  });

  it("should offer an admin their own groups until the platform's groups load, so the switcher does not blank out", () => {
    store.currentUser = asUser({ isAdmin: true });
    mockAxios.get.mockReturnValue(new Promise(() => undefined));
    const { result } = renderSwitchableGroups();
    expect(result.current).toEqual([ownGroup]);
  });

  it('should offer anyone else only the groups on their token, without fetching the platform groups', () => {
    store.currentUser = asUser({ isAdmin: false });
    const { result } = renderSwitchableGroups();
    expect(result.current).toEqual([ownGroup]);
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should offer nothing when no one is logged in', () => {
    store.currentUser = null;
    const { result } = renderSwitchableGroups();
    expect(result.current).toEqual([]);
    expect(mockAxios.get).not.toHaveBeenCalled();
  });
});
