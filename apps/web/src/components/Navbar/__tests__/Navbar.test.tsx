import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ClipboardListIcon, DatabaseIcon, LayersIcon, UsersIcon } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import type { NavItem } from '@/hooks/useNavItems';

import { Navbar } from '../Navbar';

import '@/services/i18n';

const mocks = vi.hoisted(() => {
  const navItems: NavItem[][] = [];
  const store: { currentSession: null | { id: string }; endSession: Mock } = {
    currentSession: null,
    endSession: vi.fn()
  };
  return {
    isDesktop: false,
    isGroupSwitcherVisible: false,
    navigate: vi.fn(),
    navItems,
    search: {},
    store
  };
});

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: window.location.pathname, search: mocks.search }),
  useNavigate: () => mocks.navigate
}));

vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

vi.mock('@/hooks/useNavItems', () => ({ useNavItems: () => mocks.navItems }));
vi.mock('@/hooks/useIsDesktop', () => ({ useIsDesktop: () => mocks.isDesktop }));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { activeLanguages: ['en', 'fr'] } })
}));
vi.mock('@/components/GroupSwitcher', () => ({
  GroupSwitcher: () => <div data-testid="group-switcher" />,
  useIsGroupSwitcherVisible: () => mocks.isGroupSwitcherVisible
}));
vi.mock('@/components/UserDropup', () => ({ UserDropup: () => <div data-testid="user-dropup" /> }));

const globalItems: NavItem[] = [
  { icon: DatabaseIcon, label: 'Data Hub', url: '/datahub' },
  {
    children: [{ icon: UsersIcon, label: 'Users', search: { role: 'admin' }, url: '/admin/users' }],
    icon: LayersIcon,
    label: 'Administration'
  }
];

const sessionItems: NavItem[] = [
  { disabled: true, icon: ClipboardListIcon, label: 'Instruments', url: '/instruments/accessible-instruments' }
];

const openMenu = () => fireEvent.click(screen.getByTestId('navbar-menu-trigger'));
const navButton = (url: string) => screen.getByTestId(`nav-button-${url}`);
const endSessionButton = () => screen.getByTestId('nav-button-#');
const isMenuOpen = () => screen.queryByRole('dialog') !== null;

describe('Navbar', () => {
  beforeEach(() => {
    mocks.isDesktop = false;
    mocks.isGroupSwitcherVisible = false;
    mocks.navItems = [globalItems, sessionItems];
    mocks.store.currentSession = null;
    mocks.navigate.mockReset();
    mocks.store.endSession.mockReset();
    window.history.replaceState(null, '', '/');
  });

  afterEach(cleanup);

  it('should keep the navigation sheet closed until the menu is opened', () => {
    render(<Navbar />);
    expect(isMenuOpen()).toBe(false);
    openMenu();
    expect(navButton('/datahub')).toBeTruthy();
  });

  it('should open the navigation sheet from the outline button as well', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(isMenuOpen()).toBe(true);
  });

  it('should close the sheet and navigate when a link is clicked', () => {
    render(<Navbar />);
    openMenu();
    fireEvent.click(navButton('/datahub'));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/datahub' });
    expect(isMenuOpen()).toBe(false);
  });

  it('should close the sheet and navigate with the search params when a grouped link is clicked', () => {
    render(<Navbar />);
    openMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Administration' }));
    fireEvent.click(navButton('/admin/users'));
    expect(mocks.navigate).toHaveBeenCalledWith({ search: { role: 'admin' }, to: '/admin/users' });
    expect(isMenuOpen()).toBe(false);
  });

  it('should highlight the link for the current page', () => {
    window.history.replaceState(null, '', '/datahub');
    render(<Navbar />);
    openMenu();
    expect([...navButton('/datahub').classList]).toContain('bg-slate-200');
  });

  it('should disable a disabled link that is not the current page', () => {
    render(<Navbar />);
    openMenu();
    expect(navButton('/instruments/accessible-instruments').hasAttribute('disabled')).toBe(true);
  });

  it('should keep a disabled link enabled while it is the current page, so the user is not stranded', () => {
    window.history.replaceState(null, '', '/instruments/accessible-instruments');
    render(<Navbar />);
    openMenu();
    expect(navButton('/instruments/accessible-instruments').hasAttribute('disabled')).toBe(false);
  });

  it('should append the end session button to the last group only', () => {
    render(<Navbar />);
    openMenu();
    expect(endSessionButton().parentElement!.contains(navButton('/instruments/accessible-instruments'))).toBe(true);
    expect(endSessionButton().parentElement!.contains(navButton('/datahub'))).toBe(false);
  });

  it('should disable the end session button when no session is active', () => {
    render(<Navbar />);
    openMenu();
    expect(endSessionButton().hasAttribute('disabled')).toBe(true);
  });

  it('should end the session and go to the start page, bypassing any navigation blocker', () => {
    mocks.store.currentSession = { id: 'session-1' };
    render(<Navbar />);
    openMenu();
    fireEvent.click(endSessionButton());
    expect(mocks.store.endSession).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith({ ignoreBlocker: true, to: '/session/start-session' });
  });

  it('should show the group switcher in the sheet when there is a group to switch between', () => {
    mocks.isGroupSwitcherVisible = true;
    render(<Navbar />);
    openMenu();
    expect(screen.getByTestId('group-switcher')).toBeTruthy();
  });

  it('should not show the group switcher when there is no group to switch between', () => {
    render(<Navbar />);
    openMenu();
    expect(screen.queryByTestId('group-switcher')).toBeNull();
  });

  it('should offer the active languages in the sheet footer', () => {
    render(<Navbar />);
    openMenu();
    expect(screen.getByTestId('language-toggle')).toBeTruthy();
  });

  it('should close the sheet when the viewport grows to desktop size, so it does not linger beside the sidebar', () => {
    const { rerender } = render(<Navbar />);
    openMenu();
    expect(isMenuOpen()).toBe(true);
    mocks.isDesktop = true;
    rerender(<Navbar />);
    expect(isMenuOpen()).toBe(false);
  });
});
