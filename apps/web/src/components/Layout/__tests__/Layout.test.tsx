import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GroupSwitcherPosition } from '@/store/types';

import { Layout } from '../Layout';

const store = vi.hoisted((): { groupSwitcherPosition: GroupSwitcherPosition } => ({
  groupSwitcherPosition: 'sidebar'
}));
const groupSwitcher = vi.hoisted(() => ({ isVisible: true }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector: (state: typeof store) => unknown) => selector(store))
}));

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="outlet" />
}));

vi.mock('@/components/Footer', () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock('@/components/Navbar', () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => <aside data-testid="sidebar" /> }));
vi.mock('@/components/GroupSwitcher', () => ({
  GroupSwitcher: () => <div data-testid="group-switcher" />,
  useIsGroupSwitcherVisible: () => groupSwitcher.isVisible
}));

describe('Layout', () => {
  beforeEach(() => {
    store.groupSwitcherPosition = 'sidebar';
    groupSwitcher.isVisible = true;
  });

  afterEach(cleanup);

  it('should render the matched route inside the main element', () => {
    render(<Layout />);
    expect(screen.getByRole('main').contains(screen.getByTestId('outlet'))).toBe(true);
  });

  it('should render the navbar, the sidebar and the footer around the route', () => {
    render(<Layout />);
    expect(screen.getByTestId('navbar')).toBeTruthy();
    expect(screen.getByTestId('sidebar')).toBeTruthy();
    expect(screen.getByTestId('footer')).toBeTruthy();
  });

  it('should render the group switcher in the topbar when the user placed it there', () => {
    store.groupSwitcherPosition = 'topbar';
    render(<Layout />);
    expect(screen.getByTestId('group-switcher')).toBeTruthy();
  });

  it('should not render the group switcher in the topbar when it is placed in the sidebar', () => {
    render(<Layout />);
    expect(screen.queryByTestId('group-switcher')).toBeNull();
  });

  it('should not render the group switcher in the topbar when there is no group to switch between', () => {
    store.groupSwitcherPosition = 'topbar';
    groupSwitcher.isVisible = false;
    render(<Layout />);
    expect(screen.queryByTestId('group-switcher')).toBeNull();
  });
});
