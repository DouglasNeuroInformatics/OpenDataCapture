import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccessTokenValidity } from '@/store/types';

import { InactivityWarning } from '../InactivityWarning';

import '@/services/i18n';

type StoreFixture = {
  accessTokenValidity: AccessTokenValidity | null;
  isReauthenticationRequired: boolean;
  requireReauthentication: () => void;
};

const mocks = vi.hoisted(() => ({
  renewAccessToken: vi.fn(() => Promise.resolve()),
  requireReauthentication: vi.fn(),
  store: { accessTokenValidity: null, isReauthenticationRequired: false } as Omit<
    StoreFixture,
    'requireReauthentication'
  >
}));

vi.mock('@/services/token-renewal', () => ({ renewAccessToken: mocks.renewAccessToken }));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: StoreFixture) => unknown) => {
    return selector({ ...mocks.store, requireReauthentication: mocks.requireReauthentication });
  }
}));

const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();

const renderWithTimeLeft = (timeLeft: number, { isRenewable = true } = {}) => {
  mocks.store.accessTokenValidity = { expiresAt: NOW + timeLeft, isRenewable, receivedAt: NOW };
  return render(<InactivityWarning />);
};

const countdown = () => screen.getByTestId('inactivity-warning-countdown').textContent;

describe('InactivityWarning', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    mocks.store.accessTokenValidity = null;
    mocks.store.isReauthenticationRequired = false;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should stay out of the way while the token has more than two minutes left', () => {
    renderWithTimeLeft(120_001);
    expect(screen.queryByTestId('inactivity-warning')).toBeNull();
  });

  it('should appear once two minutes are left', () => {
    renderWithTimeLeft(120_000);
    expect(countdown()).toBe('2:00');
  });

  it('should count down each second', () => {
    renderWithTimeLeft(61_000);
    act(() => void vi.advanceTimersByTime(2000));
    expect(countdown()).toBe('0:59');
  });

  it('should show part of a second as a whole one, so it never reads 0:00 while the token still works', () => {
    renderWithTimeLeft(500);
    expect(countdown()).toBe('0:01');
  });

  it('should give way to the password dialog once the token has run out', () => {
    renderWithTimeLeft(1000);
    act(() => void vi.advanceTimersByTime(1000));
    expect(screen.queryByTestId('inactivity-warning')).toBeNull();
  });

  it('should give way to the password dialog when it is already open', () => {
    mocks.store.isReauthenticationRequired = true;
    renderWithTimeLeft(60_000);
    expect(screen.queryByTestId('inactivity-warning')).toBeNull();
  });

  it('should show nothing while nobody is signed in', () => {
    render(<InactivityWarning />);
    expect(screen.queryByTestId('inactivity-warning')).toBeNull();
  });

  it('should disappear when the token is renewed', () => {
    const { rerender } = renderWithTimeLeft(60_000);
    mocks.store.accessTokenValidity = { expiresAt: NOW + 900_000, isRenewable: true, receivedAt: NOW };
    rerender(<InactivityWarning />);
    expect(screen.queryByTestId('inactivity-warning')).toBeNull();
  });

  it('should disappear when the user signs out', () => {
    const { rerender } = renderWithTimeLeft(60_000);
    mocks.store.accessTokenValidity = null;
    rerender(<InactivityWarning />);
    expect(screen.queryByTestId('inactivity-warning')).toBeNull();
  });

  it('should stop its timer when it is removed', () => {
    const { unmount } = renderWithTimeLeft(60_000);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  describe('when activity can extend the sign-in', () => {
    it('should say the user will be signed out for inactivity', () => {
      renderWithTimeLeft(60_000);
      expect(screen.getByText(/signed out for inactivity/)).toBeTruthy();
    });

    it('should renew the token when the user asks to stay signed in', () => {
      renderWithTimeLeft(60_000);
      fireEvent.click(screen.getByTestId('inactivity-warning-stay-signed-in'));
      expect(mocks.renewAccessToken).toHaveBeenCalledOnce();
    });
  });

  describe('when the sign-in is about to reach its absolute limit', () => {
    it('should say the password will be needed, since activity cannot extend it', () => {
      renderWithTimeLeft(60_000, { isRenewable: false });
      expect(screen.getByText(/enter your password again/)).toBeTruthy();
    });

    it('should let the user enter their password ahead of the limit', () => {
      renderWithTimeLeft(60_000, { isRenewable: false });
      fireEvent.click(screen.getByTestId('inactivity-warning-sign-in-again'));
      expect(mocks.requireReauthentication).toHaveBeenCalledOnce();
    });
  });
});
