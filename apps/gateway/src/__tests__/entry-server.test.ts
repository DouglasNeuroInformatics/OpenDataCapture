import { describe, expect, it } from 'vitest';

import { render } from '../entry-server';

describe('render', () => {
  it('should render the landing page for a visitor who arrives without an assignment link', () => {
    const { html } = render({ activeLanguages: ['en', 'fr'], kind: 'landing', language: 'en' });
    expect(html).toContain('data-testid="gateway-landing"');
    expect(html).toContain('Welcome');
  });

  it('should render in the language it is given rather than the one the previous request left on the shared translator', () => {
    const { html } = render({ activeLanguages: ['en', 'fr'], kind: 'landing', language: 'fr' });
    expect(html).toContain('Bienvenue');
  });

  it('should not show the landing page to a patient who opened an assignment link', () => {
    const { html } = render({
      activeLanguages: ['en', 'fr'],
      id: 'assignment-1',
      kind: 'assignment',
      language: 'en',
      target: { bundle: 'export default {}', id: 'instrument-1', kind: 'FORM' },
      token: 'token'
    });
    expect(html).not.toContain('data-testid="gateway-landing"');
  });
});
