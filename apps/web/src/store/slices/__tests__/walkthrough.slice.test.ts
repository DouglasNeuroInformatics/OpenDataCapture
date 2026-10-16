import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from '@/store';

const initialState = useAppStore.getState();

describe('createWalkthroughSlice', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('should start with the walkthrough closed and not yet completed', () => {
    expect(useAppStore.getState()).toMatchObject({ isWalkthroughComplete: false, isWalkthroughOpen: false });
  });

  it('should record that the user completed the walkthrough', () => {
    useAppStore.getState().setIsWalkthroughComplete(true);
    expect(useAppStore.getState().isWalkthroughComplete).toBe(true);
  });

  it('should open the walkthrough on request', () => {
    useAppStore.getState().setIsWalkthroughOpen(true);
    expect(useAppStore.getState().isWalkthroughOpen).toBe(true);
  });
});
