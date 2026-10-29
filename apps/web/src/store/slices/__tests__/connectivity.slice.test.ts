import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useAppStore } from '@/store';
import type { AppStore } from '@/store/types';

import { createConnectivitySlice } from '../connectivity.slice';

const createStore = () => {
  return create(immer<AppStore>((...a) => ({ ...useAppStore.getState(), ...createConnectivitySlice(...a) })));
};

describe('createConnectivitySlice', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should start with no requests retrying', () => {
    expect(store.getState().pendingRetries).toBe(0);
  });

  it('should count each request that begins retrying, so the banner knows connectivity is degraded', () => {
    store.getState().beginRetry();
    store.getState().beginRetry();
    expect(store.getState().pendingRetries).toBe(2);
  });

  it('should uncount a request once its retry settles', () => {
    store.getState().beginRetry();
    store.getState().endRetry();
    expect(store.getState().pendingRetries).toBe(0);
  });

  it('should never count below zero, so an unmatched end cannot hide a later retry', () => {
    store.getState().endRetry();
    store.getState().beginRetry();
    expect(store.getState().pendingRetries).toBe(1);
  });

  it('should record the connectivity the browser reports', () => {
    store.getState().setIsOnline(false);
    expect(store.getState().isOnline).toBe(false);
  });

  it('should start offline when the browser loads without a connection', () => {
    vi.stubGlobal('navigator', { onLine: false });
    expect(createStore().getState().isOnline).toBe(false);
  });
});
