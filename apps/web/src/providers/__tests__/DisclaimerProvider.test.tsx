import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DisclaimerProvider } from '@/providers/DisclaimerProvider';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  store: {
    isDisclaimerAccepted: false,
    logout: vi.fn(),
    setIsDisclaimerAccepted: vi.fn()
  }
}));

vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

const CHILD_TEXT = 'Protected Content';

const renderProvider = () =>
  render(
    <DisclaimerProvider>
      <p>{CHILD_TEXT}</p>
    </DisclaimerProvider>
  );

beforeEach(() => {
  mocks.store.isDisclaimerAccepted = false;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DisclaimerProvider', () => {
  it('should render its children beneath the disclaimer', () => {
    renderProvider();
    expect(screen.getByText(CHILD_TEXT)).toBeTruthy();
  });

  it('should show the disclaimer until the user has accepted it', () => {
    renderProvider();
    expect(screen.getByRole('dialog', { name: 'Disclaimer' })).toBeTruthy();
  });

  it('should not show the disclaimer once the user has accepted it', () => {
    mocks.store.isDisclaimerAccepted = true;
    renderProvider();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should not move focus into the dialog when it opens, so no button is triggered by a stray keypress', () => {
    renderProvider();
    expect(document.activeElement).not.toBe(screen.getByTestId('accept-disclaimer'));
    expect(screen.getByTestId('disclaimer-dialog-content').contains(document.activeElement)).toBe(false);
  });

  it('should record the acceptance when the user accepts', () => {
    renderProvider();
    fireEvent.click(screen.getByTestId('accept-disclaimer'));
    expect(mocks.store.setIsDisclaimerAccepted).toHaveBeenCalledWith(true);
  });

  it('should log the user out when they decline', () => {
    renderProvider();
    fireEvent.click(screen.getByTestId('decline-disclaimer'));
    expect(mocks.store.logout).toHaveBeenCalledOnce();
    expect(mocks.store.setIsDisclaimerAccepted).not.toHaveBeenCalled();
  });
});
