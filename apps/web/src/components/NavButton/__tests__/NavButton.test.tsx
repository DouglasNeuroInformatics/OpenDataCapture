import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HomeIcon } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NavButton } from '../NavButton';

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mocks.navigate }));

const button = () => screen.getByTestId('nav-button-/datahub');
const classes = () => [...button().classList];

describe('NavButton', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
  });

  afterEach(cleanup);

  it('should render its label and expose its url, so the walkthrough and e2e suite can target it', () => {
    render(<NavButton icon={HomeIcon} isActive={false} label="Datahub" url="/datahub" />);
    expect(button().textContent).toBe('Datahub');
    expect(button().getAttribute('data-nav-url')).toBe('/datahub');
  });

  it('should navigate to its url with its search params when no click handler is given', () => {
    render(<NavButton icon={HomeIcon} isActive={false} label="Datahub" search={{ tab: 'all' }} url="/datahub" />);
    fireEvent.click(button());
    expect(mocks.navigate).toHaveBeenCalledWith({ search: { tab: 'all' }, to: '/datahub' });
  });

  it('should hand the url and search params to the click handler instead of navigating itself', () => {
    const onClick = vi.fn();
    render(
      <NavButton
        icon={HomeIcon}
        isActive={false}
        label="Datahub"
        search={{ tab: 'all' }}
        url="/datahub"
        onClick={onClick}
      />
    );
    fireEvent.click(button());
    expect(onClick).toHaveBeenCalledWith('/datahub', { tab: 'all' });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('should apply the active styling and the caller active class when active', () => {
    render(<NavButton activeClassName="is-current" icon={HomeIcon} isActive={true} label="Datahub" url="/datahub" />);
    expect(classes()).toEqual(expect.arrayContaining(['bg-slate-800', 'is-current']));
  });

  it('should not apply the caller active class when inactive', () => {
    render(<NavButton activeClassName="is-current" icon={HomeIcon} isActive={false} label="Datahub" url="/datahub" />);
    expect(classes()).not.toContain('is-current');
  });

  it('should disable the button when the item is disabled', () => {
    render(<NavButton disabled icon={HomeIcon} isActive={false} label="Datahub" url="/datahub" />);
    expect(button().hasAttribute('disabled')).toBe(true);
  });

  it('should forward its ref to the button, so a tooltip trigger can wrap it', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<NavButton icon={HomeIcon} isActive={false} label="Datahub" ref={ref} url="/datahub" />);
    expect(ref.current).toBe(button());
  });
});
