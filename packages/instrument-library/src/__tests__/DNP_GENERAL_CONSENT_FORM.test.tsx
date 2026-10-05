import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import instrument from '../forms/DNP_GENERAL_CONSENT_FORM/index.tsx';

function getPreambleBlock() {
  if (!Array.isArray(instrument.content)) {
    throw new Error('Expected the consent form content to be an array of groups');
  }
  const block = instrument.content[0];
  if (block?.kind !== 'block') {
    throw new Error('Expected the consent form to open with a block');
  }
  return block;
}

describe('DNP_GENERAL_CONSENT_FORM', () => {
  afterEach(() => {
    cleanup();
  });

  it('should translate both preamble paragraphs through the provided translator', () => {
    const t = vi.fn((translations: { en?: string; fr?: string }) => translations.fr ?? '');
    render(getPreambleBlock().render({}, { t }));
    const paragraphs = screen.getByTestId('consent-preamble').querySelectorAll('p');
    expect(t).toHaveBeenCalledTimes(2);
    expect(paragraphs[0]?.textContent).toMatch(/^ATTENDU QUE/);
    expect(paragraphs[1]?.textContent).toMatch(/^Aucune disposition/);
  });

  it('should accept either answer to the consent question, so declining is recorded too', () => {
    expect(instrument.validationSchema.safeParse({ consent: true }).success).toBe(true);
    expect(instrument.validationSchema.safeParse({ consent: false }).success).toBe(true);
  });

  it('should reject a submission with no consent answer', () => {
    expect(instrument.validationSchema.safeParse({}).success).toBe(false);
  });
});
