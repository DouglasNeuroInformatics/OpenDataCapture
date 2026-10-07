import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/store';

const initialState = useAppStore.getState();

const importFreshStore = async () => {
  vi.resetModules();
  const { useAppStore: freshStore } = await import('@/store');
  return freshStore;
};

describe('createConnectivitySlice', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should start with no requests retrying', () => {
    expect(initialState.pendingRetries).toBe(0);
  });

  it('should count each request that begins retrying, so the banner knows connectivity is degraded', () => {
    useAppStore.getState().beginRetry();
    useAppStore.getState().beginRetry();
    expect(useAppStore.getState().pendingRetries).toBe(2);
  });

  it('should uncount a request once its retry settles', () => {
    useAppStore.getState().beginRetry();
    useAppStore.getState().endRetry();
    expect(useAppStore.getState().pendingRetries).toBe(0);
  });

  it('should never count below zero, so an unmatched end cannot hide a later retry', () => {
    useAppStore.getState().endRetry();
    useAppStore.getState().beginRetry();
    expect(useAppStore.getState().pendingRetries).toBe(1);
  });

  it('should record the connectivity the browser reports', () => {
    useAppStore.getState().setIsOnline(false);
    expect(useAppStore.getState().isOnline).toBe(false);
  });

  it('should start offline when the browser loads without a connection', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    const freshStore = await importFreshStore();
    expect(freshStore.getState().isOnline).toBe(false);
  });
});
