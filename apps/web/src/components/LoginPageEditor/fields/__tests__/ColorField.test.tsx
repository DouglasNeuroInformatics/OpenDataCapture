import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ColorField } from '../ColorField';

import '@/services/i18n';

const ERROR_MESSAGE = 'Enter a valid hex color.';

function renderColorField(value: string, onChange = vi.fn()) {
  render(<ColorField id="primary" label="Primary" swatchFallback="#123456" value={value} onChange={onChange} />);
  return {
    onChange,
    swatch: screen.getByLabelText<HTMLInputElement>('primary', { selector: 'input[type="color"]' }),
    textInput: screen.getByLabelText<HTMLInputElement>('Primary')
  };
}

describe('ColorField', () => {
  afterEach(cleanup);

  it('should show a valid hex in both inputs and no error', () => {
    const { swatch, textInput } = renderColorField('#abcdef');
    expect(swatch.value).toBe('#abcdef');
    expect(textInput.value).toBe('#abcdef');
    expect(screen.queryByText(ERROR_MESSAGE)).toBeNull();
  });

  it('should fall back on the swatch color for an invalid hex, since a native color input rejects it', () => {
    const { swatch } = renderColorField('not-a-color');
    expect(swatch.value).toBe('#123456');
  });

  it('should flag an invalid hex inline, so the admin knows why Save is disabled', () => {
    renderColorField('#12');
    expect(screen.getByText(ERROR_MESSAGE)).toBeTruthy();
  });

  it('should report text typed into the hex input', () => {
    const { onChange, textInput } = renderColorField('#abcdef');
    fireEvent.change(textInput, { target: { value: '#000' } });
    expect(onChange).toHaveBeenCalledWith('#000');
  });

  it('should report a color picked from the swatch', () => {
    const { onChange, swatch } = renderColorField('#abcdef');
    fireEvent.change(swatch, { target: { value: '#ff0000' } });
    expect(onChange).toHaveBeenCalledWith('#ff0000');
  });

  it('should show the default placeholder when none is given', () => {
    const { textInput } = renderColorField('');
    expect(textInput.placeholder).toBe('#0ea5e9');
  });
});
