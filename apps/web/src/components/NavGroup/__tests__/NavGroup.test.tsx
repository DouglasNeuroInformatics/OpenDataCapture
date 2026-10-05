import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DatabaseIcon, FileTextIcon, LayersIcon } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { NavItem } from '@/hooks/useNavItems';

import { NavGroup } from '../NavGroup';

type MockLocation = { pathname: string; search?: { [key: string]: unknown } };

const mocks = vi.hoisted(() => {
  const location: MockLocation = { pathname: '/', search: {} };
  return { location, navigate: vi.fn() };
});

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => mocks.location,
  useNavigate: () => mocks.navigate
}));

const items: NavItem[] = [
  { icon: DatabaseIcon, label: 'Datahub', url: '/datahub' },
  { icon: FileTextIcon, label: 'Active logs', search: { status: 'active' }, url: '/logs' },
  {
    children: [{ disabled: true, icon: FileTextIcon, label: 'Audit', url: '/admin/audit' }],
    icon: LayersIcon,
    label: 'Admin'
  }
];

const renderGroup = (onNavigate?: (url: string, search?: { [key: string]: string }) => void) =>
  render(<NavGroup icon={LayersIcon} items={items} label="Tools" onNavigate={onNavigate} />);

const toggle = (label = 'Tools') => screen.getByRole('button', { name: label });
const isExpanded = (label = 'Tools') => toggle(label).getAttribute('aria-expanded') === 'true';
const navButton = (testId: string) => screen.getByTestId(`nav-button-${testId}`);

const visit = (pathname: string, search?: { [key: string]: unknown }) => {
  mocks.location = { pathname, search };
};

describe('NavGroup', () => {
  beforeEach(() => {
    visit('/', {});
    mocks.navigate.mockReset();
  });

  afterEach(cleanup);

  it('should start collapsed when none of its items is the current page', () => {
    renderGroup();
    expect(isExpanded()).toBe(false);
    expect(screen.queryByTestId('nav-button-/datahub')).toBeNull();
  });

  it('should start expanded when one of its items is the current page, so the active link is visible', () => {
    visit('/datahub');
    renderGroup();
    expect(isExpanded()).toBe(true);
  });

  it('should expand and collapse when its header is clicked', () => {
    renderGroup();
    fireEvent.click(toggle());
    expect(isExpanded()).toBe(true);
    fireEvent.click(toggle());
    expect(isExpanded()).toBe(false);
  });

  it('should expand when the user navigates to one of its items', () => {
    const { rerender } = renderGroup();
    visit('/datahub', {});
    rerender(<NavGroup icon={LayersIcon} items={items} label="Tools" />);
    expect(isExpanded()).toBe(true);
  });

  it('should collapse when the user navigates away from its items', () => {
    visit('/datahub', {});
    const { rerender } = renderGroup();
    visit('/elsewhere', {});
    rerender(<NavGroup icon={LayersIcon} items={items} label="Tools" />);
    expect(isExpanded()).toBe(false);
  });

  it('should mark an item active only when the current search params match its own', () => {
    visit('/logs', { status: 'active' });
    renderGroup();
    expect([...navButton('/logs').classList]).toContain('bg-slate-800');
  });

  it('should not mark an item active when its path matches but its search params differ', () => {
    visit('/logs', { status: 'archived' });
    renderGroup();
    fireEvent.click(toggle());
    expect([...navButton('/logs').classList]).not.toContain('bg-slate-800');
  });

  it('should treat a location without search params as having none', () => {
    visit('/logs', undefined);
    renderGroup();
    expect(isExpanded()).toBe(false);
  });

  it('should expand when the current page is inside a nested group', () => {
    visit('/admin/audit', {});
    renderGroup();
    expect(isExpanded()).toBe(true);
    expect(isExpanded('Admin')).toBe(true);
  });

  it('should keep a disabled item enabled while it is the current page, so the user is not stranded', () => {
    visit('/admin/audit', {});
    renderGroup();
    expect(navButton('/admin/audit').hasAttribute('disabled')).toBe(false);
  });

  it('should disable a disabled item when it is not the current page', () => {
    renderGroup();
    fireEvent.click(toggle());
    fireEvent.click(toggle('Admin'));
    expect(navButton('/admin/audit').hasAttribute('disabled')).toBe(true);
  });

  it('should hand the url and search params of a clicked item to the navigate handler', () => {
    const onNavigate = vi.fn();
    renderGroup(onNavigate);
    fireEvent.click(toggle());
    fireEvent.click(navButton('/logs'));
    expect(onNavigate).toHaveBeenCalledWith('/logs', { status: 'active' });
  });

  it('should pass the navigate handler down to nested groups', () => {
    const onNavigate = vi.fn();
    visit('/admin/audit', {});
    renderGroup(onNavigate);
    fireEvent.click(navButton('/admin/audit'));
    expect(onNavigate).toHaveBeenCalledWith('/admin/audit', undefined);
  });
});
