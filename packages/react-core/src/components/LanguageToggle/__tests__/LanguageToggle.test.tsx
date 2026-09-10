import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { LanguageToggle } from '../LanguageToggle';

describe('LanguageToggle', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing when fewer than two languages are active', () => {
    render(<LanguageToggle activeLanguages={['en']} />);
    expect(screen.queryByTestId('language-toggle')).toBeNull();
  });

  it('should render the toggle when two or more languages are active', () => {
    render(<LanguageToggle activeLanguages={['en', 'fr']} />);
    expect(screen.getByTestId('language-toggle')).toBeTruthy();
  });

  it('should move off a language that has been deactivated, rather than strand a reader on it', async () => {
    i18n.changeLanguage('en');
    render(<LanguageToggle activeLanguages={['es', 'fr']} />);
    await waitFor(() => {
      expect(i18n.resolvedLanguage).toBe('es');
    });
    i18n.changeLanguage('en');
  });
});
