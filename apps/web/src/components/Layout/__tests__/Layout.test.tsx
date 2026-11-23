import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Layout } from '../Layout';

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="outlet" />
}));

vi.mock('@/components/Footer', () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock('@/components/Navbar', () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => <aside data-testid="sidebar" /> }));

describe('Layout', () => {
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
});
