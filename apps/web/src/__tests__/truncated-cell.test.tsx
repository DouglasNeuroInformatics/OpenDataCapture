import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TruncatedCell } from '@/components/TruncatedCell';

describe('TruncatedCell', () => {
  it('should render the value', () => {
    render(<TruncatedCell title="Baseline Battery" value="Baseline Battery" />);
    expect(screen.getByText('Baseline Battery')).toBeTruthy();
  });

  // A clipped cell is unreadable without this: the ellipsis hides exactly the part the user wants.
  it('should expose the full value on hover, so a clipped cell is still recoverable', () => {
    render(<TruncatedCell title="A very long series name" value="A very long series name" />);
    expect(screen.getByText('A very long series name').getAttribute('title')).toBe('A very long series name');
  });

  // Wrapping is what pushed rows to two lines; clipping to one is the whole point of the component.
  it('should clip to one line rather than wrapping the row taller', () => {
    render(<TruncatedCell title="x" value="x" />);
    const className = screen.getByText('x').getAttribute('class') ?? '';
    expect(className).toContain('whitespace-nowrap');
    expect(className).toContain('overflow-hidden');
    expect(className).toContain('text-ellipsis');
  });

  it('should carry a test id through for the e2e suite to select on', () => {
    render(<TruncatedCell data-testid="record-cell-series" title="x" value="x" />);
    expect(screen.getByTestId('record-cell-series')).toBeTruthy();
  });
});
