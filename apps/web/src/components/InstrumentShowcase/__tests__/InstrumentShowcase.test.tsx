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

  it('should not select anything when Enter is pressed with no matching instruments', () => {
    const onSelect = vi.fn();
    render(<InstrumentShowcase data={[]} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
