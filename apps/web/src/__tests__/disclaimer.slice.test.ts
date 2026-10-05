import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from '@/store';

const initialState = useAppStore.getState();

describe('createDisclaimerSlice', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('should start with the disclaimer unaccepted, so it is shown on a first visit', () => {
    expect(useAppStore.getState().isDisclaimerAccepted).toBe(false);
  });

  it('should record that the user accepted the disclaimer', () => {
    useAppStore.getState().setIsDisclaimerAccepted(true);
    expect(useAppStore.getState().isDisclaimerAccepted).toBe(true);
  });
});
