import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdministrationOptions } from '../AdministrationOptions';

import '@/services/i18n';

const instrument = { details: { title: 'Scale' }, id: 'scale', kind: 'FORM' } as unknown as TranslatedInstrumentInfo;

const renderOptions = (choice: Partial<Parameters<typeof AdministrationOptions>[0]['choice']>) => {
  render(
    <AdministrationOptions
      choice={{ instrument, language: 'en', languageOptions: ['en'], ...choice }}
      onLanguageChange={vi.fn()}
    />
  );
};

describe('AdministrationOptions', () => {
  afterEach(cleanup);

  it('should offer the languages of an instrument that has more than one', () => {
    renderOptions({ languageOptions: ['en', 'fr'] });
    expect(screen.getByTestId('administration-language')).toBeTruthy();
  });

  it('should leave out the language dropdown when there is only one language to choose', () => {
    renderOptions({ languageOptions: ['en'] });
    expect(screen.queryByTestId('administration-language')).toBeNull();
  });

  it('should leave out the language dropdown when no allowed language is offered, rather than offer an empty one', () => {
    renderOptions({ language: undefined, languageOptions: [] });
    expect(screen.queryByTestId('administration-language')).toBeNull();
  });
});
