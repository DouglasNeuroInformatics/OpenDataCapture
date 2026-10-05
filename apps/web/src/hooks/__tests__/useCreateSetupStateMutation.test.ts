import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { $InitAppOptions } from '@opendatacapture/schemas/setup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateSetupStateMutation } from '../useCreateSetupStateMutation';

const mockAxios = vi.hoisted(() => ({ post: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

const OPTIONS: $InitAppOptions = {
  admin: { firstName: 'Ada', lastName: 'Lovelace', password: 'correct horse battery staple', username: 'ada' },
  enableExperimentalFeatures: false,
  initDemo: true
};

function renderSetupMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useCreateSetupStateMutation(), { wrapper }), invalidateQueries };
}

describe('useCreateSetupStateMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: {} });
  });

  it('should lift the default timeout, since seeding a demo instance can outlast it', async () => {
    const { result } = renderSetupMutation();
    await result.current.mutateAsync(OPTIONS);
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/setup', OPTIONS, { meta: { disableDefaultTimeout: true } });
  });

  it('should announce success once the instance is set up', async () => {
    const { result } = renderSetupMutation();
    await result.current.mutateAsync(OPTIONS);
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh the setup state before settling, so the setup page is not shown again', async () => {
    const { invalidateQueries, result } = renderSetupMutation();
    const { promise: refresh, resolve: finishRefresh } = Promise.withResolvers<void>();
    invalidateQueries.mockReturnValue(refresh);
    const onSettled = vi.fn();
    const mutation = result.current.mutateAsync(OPTIONS).then(onSettled);
    await vi.waitFor(() => expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['setup-state'] }));
    expect(onSettled).not.toHaveBeenCalled();
    finishRefresh();
    await mutation;
    expect(onSettled).toHaveBeenCalled();
  });
});
