import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { SeriesProgressBar } from '../SeriesProgressBar';

describe('SeriesProgressBar', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('should name the item in progress, which is the one after those completed', () => {
    render(<SeriesProgressBar completed={1} total={3} />);
    expect(screen.getByText('Instrument 2 of 3')).toBeTruthy();
  });

  it('should report the completed count to assistive technology', () => {
    render(<SeriesProgressBar completed={1} total={3} />);
    const progressBar = screen.getByRole('progressbar', { name: 'Series progress' });
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('3');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('1');
  });

  it('should not name an item past the last, in the render before the completion screen replaces it', () => {
    render(<SeriesProgressBar completed={3} total={3} />);
    expect(screen.getByText('Instrument 3 of 3')).toBeTruthy();
  });

  it('should follow the completed count as it advances', () => {
    const { rerender } = render(<SeriesProgressBar completed={0} total={2} />);
    rerender(<SeriesProgressBar completed={1} total={2} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1');
    expect(screen.getByText('Instrument 2 of 2')).toBeTruthy();
  });
});
