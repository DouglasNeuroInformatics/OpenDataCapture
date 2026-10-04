import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InstrumentShowcase } from '../InstrumentShowcase';

// Initialises the shared libui translator, which the showcase's controls read on render.
import '@/services/i18n';

describe('InstrumentShowcase', () => {
  afterEach(cleanup);

  it('should not submit the wrapping search form when Enter is pressed with no matching instruments', () => {
    render(<InstrumentShowcase data={[]} onSelect={vi.fn()} />);
    const searchBar = screen.getByRole('searchbox');
    // fireEvent returns false when the event was canceled (preventDefault called). Leaving it
    // un-cancelled lets the SearchBar form submit and reload the app back to the login page.
    expect(fireEvent.keyDown(searchBar, { key: 'Enter' })).toBe(false);
  });

  // happy-dom computes no layout, so the responsive stacking is asserted through its utility classes;
  // testing/src/specs/accessible-instruments.spec.ts measures the rendered result at phone width.
  it('should stack the search bar above the filters below the lg breakpoint, so a phone gives it the full width', () => {
    render(<InstrumentShowcase data={[]} onSelect={vi.fn()} />);
    const searchBar = screen.getByTestId('instrument-search-bar');
    expect([...searchBar.classList]).toContain('w-full');
    expect([...searchBar.parentElement!.classList]).toEqual(expect.arrayContaining(['flex-col', 'lg:flex-row']));
  });

  it('should not select anything when Enter is pressed with no matching instruments', () => {
    const onSelect = vi.fn();
    render(<InstrumentShowcase data={[]} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
