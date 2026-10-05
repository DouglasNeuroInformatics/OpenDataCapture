import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FontSizeField } from '../FontSizeField';

import '@/services/i18n';

function openAndPick(optionName: string) {
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: optionName }));
}

describe('FontSizeField', () => {
  afterEach(cleanup);

  it('should show Default when no size is set, since null means the default size', () => {
    render(<FontSizeField id="name-size" value={null} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox').textContent).toBe('Default');
  });

  it('should show the current size in pixels', () => {
    render(<FontSizeField id="name-size" value={24} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox').textContent).toBe('24 px');
  });

  it('should report a picked size as a number', () => {
    const onChange = vi.fn();
    render(<FontSizeField id="name-size" value={null} onChange={onChange} />);
    openAndPick('32 px');
    expect(onChange).toHaveBeenCalledWith(32);
  });

  it('should report null when Default is picked, so the override is cleared rather than stored', () => {
    const onChange = vi.fn();
    render(<FontSizeField id="name-size" value={24} onChange={onChange} />);
    openAndPick('Default');
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
