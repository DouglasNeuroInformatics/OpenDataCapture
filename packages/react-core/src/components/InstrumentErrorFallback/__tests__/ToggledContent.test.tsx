import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ToggledContent } from '../ToggledContent';

describe('ToggledContent', () => {
  afterEach(cleanup);

  it('should rotate the chevron open, then closed, as the label is clicked', () => {
    render(
      <ToggledContent label="Details">
        <p data-testid="child" />
      </ToggledContent>
    );
    const button = screen.getByText('Details').closest('button')!;
    const chevron = button.querySelector('svg')!;
    expect(chevron.getAttribute('class')).not.toContain('rotate-180');
    fireEvent.click(button);
    expect(chevron.getAttribute('class')).toContain('rotate-180');
    fireEvent.click(button);
    expect(chevron.getAttribute('class')).not.toContain('rotate-180');
  });
});
