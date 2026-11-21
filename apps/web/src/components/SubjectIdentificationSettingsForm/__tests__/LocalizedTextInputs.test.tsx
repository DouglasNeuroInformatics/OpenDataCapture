import type { LocalizedString } from '@opendatacapture/schemas/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LocalizedTextInputs } from '../LocalizedTextInputs';

import '@/services/i18n';

const renderInputs = (value: LocalizedString | undefined, props: { isMissing?: boolean } = {}) => {
  const onChange = vi.fn<(value: LocalizedString) => void>();
  render(
    <LocalizedTextInputs
      description="Shown to staff"
      idPrefix="label"
      label="Label"
      languages={['en', 'fr']}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
  return onChange;
};

const input = (testId: string) => screen.getByTestId<HTMLInputElement>(testId);

describe('LocalizedTextInputs', () => {
  afterEach(cleanup);

  it('should show one input per offered language, holding the text written in it', () => {
    renderInputs({ en: 'Animal ID' });
    expect(input('label-en').value).toBe('Animal ID');
    expect(input('label-fr').value).toBe('');
    expect(screen.queryByTestId('label-es')).toBeNull();
  });

  it('should keep text in a language not offered when another is edited, so turning a language off loses nothing', () => {
    const onChange = renderInputs({ en: 'Animal ID', es: 'ID del animal' });
    fireEvent.change(input('label-fr'), { target: { value: "ID de l'animal" } });
    expect(onChange).toHaveBeenCalledWith({ en: 'Animal ID', es: 'ID del animal', fr: "ID de l'animal" });
  });

  it('should ask for the text in some language when it is missing', () => {
    renderInputs(undefined, { isMissing: true });
    expect(screen.getByTestId('label-error').textContent).toBe('Enter this in at least one language.');
  });

  it('should show no error when the text is not missing', () => {
    renderInputs(undefined);
    expect(screen.queryByTestId('label-error')).toBeNull();
  });
});
