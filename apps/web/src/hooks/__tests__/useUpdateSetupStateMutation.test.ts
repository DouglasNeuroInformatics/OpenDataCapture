import type { PropsWithChildren, ReactNode } from 'react';
import { Component, createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateSetupStateMutation } from '../useUpdateSetupStateMutation';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

class ErrorBoundary extends Component<{ children: ReactNode; onError: (error: unknown) => void }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

// The app default is `throwOnError: true`; mirroring it shows whether the hook keeps or overrides it.
function renderSetupStateMutation(...args: Parameters<typeof useUpdateSetupStateMutation>) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, throwOnError: true } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const onError = vi.fn();
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, createElement(ErrorBoundary, { children, onError }));
  return { ...renderHook(() => useUpdateSetupStateMutation(...args), { wrapper }), invalidateQueries, onError };
}

describe('useUpdateSetupStateMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should save the setup state and refresh it, so every page reads the new settings', async () => {
    const { invalidateQueries, result } = renderSetupStateMutation();
    await result.current.mutateAsync({ isExperimentalFeaturesEnabled: true });
    expect(mockAxios.patch).toHaveBeenCalledWith('/v1/setup', { isExperimentalFeaturesEnabled: true });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['setup-state'] });
  });

  it('should raise no toast unless the caller asks for one, so an autosave stays quiet', async () => {
    const { result } = renderSetupStateMutation();
    await result.current.mutateAsync({ isExperimentalFeaturesEnabled: true });
    expect(addNotification).not.toHaveBeenCalled();
  });

  it('should raise the success toast the caller supplied', async () => {
    const { result } = renderSetupStateMutation({ successNotification: { message: 'Saved', title: 'Settings' } });
    await result.current.mutateAsync({ isExperimentalFeaturesEnabled: true });
    expect(addNotification).toHaveBeenCalledWith({ message: 'Saved', title: 'Settings', type: 'success' });
  });

  it('should hand a failure to the error boundary by default, as the app does for a submitted form', async () => {
    mockAxios.patch.mockRejectedValueOnce(new Error('Forbidden'));
    const { onError, result } = renderSetupStateMutation();
    act(() => result.current.mutate({ isExperimentalFeaturesEnabled: true }));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(new Error('Forbidden')));
  });

  it('should keep a failure on the page for a caller that opts out, so an autosave can show it beside the control', async () => {
    mockAxios.patch.mockRejectedValueOnce(new Error('Forbidden'));
    const { onError, result } = renderSetupStateMutation({ throwOnError: false });
    act(() => result.current.mutate({ isExperimentalFeaturesEnabled: true }));
    await waitFor(() => expect(result.current.error).toStrictEqual(new Error('Forbidden')));
    expect(onError).not.toHaveBeenCalled();
  });
});
