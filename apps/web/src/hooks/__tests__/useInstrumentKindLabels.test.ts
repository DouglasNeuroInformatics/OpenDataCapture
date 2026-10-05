import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useInstrumentKindLabels } from '../useInstrumentKindLabels';

import '@/services/i18n';

describe('useInstrumentKindLabels', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should name every instrument kind, so none reaches the screen as its stored value', () => {
    const { result } = renderHook(() => useInstrumentKindLabels());
    expect(result.current).toStrictEqual({
      FILE: 'File',
      FORM: 'Form',
      INTERACTIVE: 'Interactive',
      SERIES: 'Series'
    });
  });

  // The kind is shown in a table cell and in the filter that narrows on it; both read this map, so
  // a reader cannot be offered "Formulaire" and then shown "Form".
  it('should follow the interface language', () => {
    i18n.changeLanguage('fr');
    const { result } = renderHook(() => useInstrumentKindLabels());
    expect(result.current.FORM).toBe('Formulaire');
    expect(result.current.SERIES).toBe('Série');
  });
});
