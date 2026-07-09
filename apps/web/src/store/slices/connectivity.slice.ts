import type { ConnectivitySlice, SliceCreator } from '../types';

export const createConnectivitySlice: SliceCreator<ConnectivitySlice> = (set) => ({
  beginRetry: () => {
    set((state) => {
      state.pendingRetries += 1;
    });
  },
  endRetry: () => {
    set((state) => {
      state.pendingRetries = Math.max(0, state.pendingRetries - 1);
    });
  },
  isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
  pendingRetries: 0,
  setIsOnline: (isOnline: boolean) => {
    set((state) => {
      state.isOnline = isOnline;
    });
  }
});
