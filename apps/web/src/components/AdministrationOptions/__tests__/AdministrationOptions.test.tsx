import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdministrationOptions } from '../AdministrationOptions';

import '@/services/i18n';

const instrument = { details: { title: 'Scale' }, id: 'scale', kind: 'FORM' } as unknown as TranslatedInstrumentInfo;

const renderOptions = (
  choice: Partial<Parameters<typeof AdministrationOptions>[0]['choice']>,
  onLanguageChange = vi.fn()
) => {
  render(
    <AdministrationOptions
      choice={{ instrument, language: undefined, languageOptions: ['en'], ...choice }}
      onLanguageChange={onLanguageChange}
    />
  );
  return onLanguageChange;
};

const chooseOption = (name: string) => {
  fireEvent.click(screen.getByTestId('administration-language'));
  fireEvent.click(screen.getByRole('option', { name }));
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

  it('should leave the language to the browser by default, which is what no choice means', () => {
    renderOptions({ languageOptions: ['en', 'fr'] });
    expect(screen.getByTestId('administration-language').textContent).toBe("The subject's browser language");
  });

  it('should pin the link to a language the user picks', () => {
    const onLanguageChange = renderOptions({ languageOptions: ['en', 'fr'] });
    chooseOption('French');
    expect(onLanguageChange).toHaveBeenCalledWith('fr');
  });

  it('should hand back no language when the browser option is picked again', () => {
    const onLanguageChange = renderOptions({ language: 'fr', languageOptions: ['en', 'fr'] });
    chooseOption("The subject's browser language");
    expect(onLanguageChange).toHaveBeenCalledWith(undefined);
  });
});
