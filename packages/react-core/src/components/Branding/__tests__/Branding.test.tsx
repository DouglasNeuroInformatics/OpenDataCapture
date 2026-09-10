import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Branding } from '../Branding';

describe('Branding', () => {
  afterEach(cleanup);

  it.each(['lg', 'md', 'sm'] as const)('should render the wordmark at font size %s', (fontSize) => {
    render(<Branding fontSize={fontSize} />);
    expect(screen.getByText('Open Data Capture')).toBeTruthy();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Branding onClick={onClick} />);
    fireEvent.click(screen.getByText('Open Data Capture'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
