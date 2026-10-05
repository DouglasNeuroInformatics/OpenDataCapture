import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserDropup } from '../UserDropup';

import '@/services/i18n';

type MockStore = {
  currentSession: null | { id: string };
  currentUser: null | { username: string };
  logout: () => void;
  setIsWalkthroughOpen: (isOpen: boolean) => void;
};

const mocks = vi.hoisted(() => {
  const store: MockStore = {
    currentSession: null,
    currentUser: { username: 'jane.doe' },
    logout: vi.fn(),
    setIsWalkthroughOpen: vi.fn()
  };
  return { navigate: vi.fn(), store };
});

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate
}));

vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

const openMenu = () => {
  render(<UserDropup />);
  fireEvent.keyDown(screen.getByTestId('user-dropup-trigger'), { key: 'Enter' });
};

describe('UserDropup', () => {
  beforeEach(() => {
    mocks.store.currentSession = null;
    mocks.store.currentUser = { username: 'jane.doe' };
    mocks.navigate.mockReset();
    vi.mocked(mocks.store.logout).mockReset();
    vi.mocked(mocks.store.setIsWalkthroughOpen).mockReset();
  });

  afterEach(cleanup);

  it('should name the signed-in user on the trigger, so they can tell whose account is open', () => {
    render(<UserDropup />);
    expect(screen.getByTestId('user-dropup-trigger').textContent).toContain('jane.doe');
  });

  it('should keep the menu closed until the trigger is activated', () => {
    render(<UserDropup />);
    expect(screen.queryByTestId('user-dropup-menu')).toBeNull();
  });

  it('should label the open menu with the username', () => {
    openMenu();
    expect(screen.getByTestId('user-dropup-menu').textContent).toContain('jane.doe');
  });

  it('should render no username while no user is signed in', () => {
    mocks.store.currentUser = null;
    render(<UserDropup />);
    expect(screen.getByTestId('user-dropup-trigger').textContent).toBe('');
  });

  it('should navigate to the about page', () => {
    openMenu();
    fireEvent.click(screen.getByTestId('user-dropup-about'));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/about' });
  });

  it("should navigate to the user's account page", () => {
    openMenu();
    fireEvent.click(screen.getByTestId('user-dropup-account'));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/user' });
  });

  it('should open the tutorial walkthrough', () => {
    openMenu();
    fireEvent.click(screen.getByTestId('user-dropup-tutorial'));
    expect(mocks.store.setIsWalkthroughOpen).toHaveBeenCalledWith(true);
  });

  it('should disable the tutorial during a session, since the walkthrough would navigate away from it', () => {
    mocks.store.currentSession = { id: 'session-1' };
    openMenu();
    expect(screen.getByTestId('user-dropup-tutorial').hasAttribute('data-disabled')).toBe(true);
  });

  it('should leave the tutorial enabled outside a session', () => {
    openMenu();
    expect(screen.getByTestId('user-dropup-tutorial').hasAttribute('data-disabled')).toBe(false);
  });

  it('should log the user out', () => {
    openMenu();
    fireEvent.click(screen.getByTestId('user-dropup-logout'));
    expect(mocks.store.logout).toHaveBeenCalledOnce();
  });
});
