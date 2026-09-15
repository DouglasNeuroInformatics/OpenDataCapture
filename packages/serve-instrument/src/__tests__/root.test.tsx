import { renderToStaticMarkup } from 'react-dom/server';

import { encodeUnicodeToBase64 } from '@opendatacapture/runtime-internal';
import { describe, expect, it } from 'vitest';

import { Root } from '../root';

const BUNDLE = "(async () => ({ kind: 'FORM', language: 'en', content: {}, details: { title: 'Stub' } }))()";

describe('Root', () => {
  it('should render the instrument list, grouped by kind, for the index page', () => {
    const html = renderToStaticMarkup(
      <Root
        instruments={[
          { name: 'happiness', type: 'forms' },
          { name: 'stroop', type: 'interactive' }
        ]}
        page="index"
      />
    );
    expect(html).toContain('Instruments');
    expect(html).toContain('Forms');
    expect(html).toContain('/forms/happiness');
    expect(html).toContain('Interactive');
    expect(html).toContain('/interactive/stroop');
  });

  it('should omit a section entirely when it has no instruments', () => {
    const html = renderToStaticMarkup(<Root instruments={[{ name: 'happiness', type: 'forms' }]} page="index" />);
    expect(html).toContain('Forms');
    expect(html).not.toContain('Interactive');
  });

  it('should render the single-instrument page without a back link', () => {
    const html = renderToStaticMarkup(<Root encodedBundle={encodeUnicodeToBase64(BUNDLE)} page="single" />);
    expect(html).not.toContain('Back to list');
  });

  it("should render an instrument page with a back link naming the instrument's type and name", () => {
    const html = renderToStaticMarkup(
      <Root
        encodedBundle={encodeUnicodeToBase64(BUNDLE)}
        instrumentName="happiness"
        instrumentType="forms"
        page="instrument"
      />
    );
    expect(html).toContain('Back to list');
    expect(html).toContain('forms/happiness');
  });
});
