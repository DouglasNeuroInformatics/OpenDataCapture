import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BoldToggle } from '../BoldToggle';

import '@/services/i18n';

describe('BoldToggle', () => {
  afterEach(cleanup);

  it('should label the checkbox, so clicking the word Bold toggles it', () => {
    const onChange = vi.fn();
    render(<BoldToggle checked={false} id="bold-name" onChange={onChange} />);
    fireEvent.click(screen.getByText('Bold'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should report false when a checked toggle is cleared', () => {
    const onChange = vi.fn();
    render(<BoldToggle checked id="bold-name" onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should reflect the checked prop in its accessible state', () => {
    render(<BoldToggle checked id="bold-name" onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
  });
});
