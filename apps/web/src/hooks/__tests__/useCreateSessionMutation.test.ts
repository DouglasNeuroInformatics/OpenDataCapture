import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { $CreateSessionData } from '@opendatacapture/schemas/session';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateSessionMutation } from '../useCreateSessionMutation';

const mockAxios = vi.hoisted(() => ({ post: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

const DATA: $CreateSessionData = {
  date: new Date('2026-01-01T00:00:00.000Z'),
  groupId: 'group-1',
  subjectData: { id: 'subject-1' },
  type: 'IN_PERSON'
};

const SESSION = {
  createdAt: '2026-01-01T00:00:00.000Z',
  date: '2026-01-01T00:00:00.000Z',
  groupId: 'group-1',
  id: 'session-1',
  subject: null,
  subjectId: 'subject-1',
  type: 'IN_PERSON',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

function renderCreateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useCreateSessionMutation(), { wrapper });
}

describe('useCreateSessionMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: SESSION });
  });

  it('should send the session as the request body', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync(DATA);
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/sessions', DATA);
  });

  it('should resolve to the parsed session, so its date is a Date rather than a string', async () => {
    const { result } = renderCreateMutation();
    const session = await result.current.mutateAsync(DATA);
    expect(session.date).toEqual(new Date(SESSION.date));
  });

  it('should reject a malformed session rather than start one the app cannot describe', async () => {
    mockAxios.post.mockResolvedValue({ data: { ...SESSION, type: 'UNKNOWN' } });
    const { result } = renderCreateMutation();
    await expect(result.current.mutateAsync(DATA)).rejects.toThrow();
    expect(addNotification).not.toHaveBeenCalled();
  });

  it('should announce success once the session is started', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync(DATA);
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });
});
