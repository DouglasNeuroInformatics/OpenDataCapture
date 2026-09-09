import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { SeriesInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { SeriesInstrumentRenderer } from '../SeriesInstrumentRenderer';

/**
 * A bundle is evaluated with `new Function`, so it can close over nothing in this file. The
 * validation schema is handed to it through `globalThis`, which is the one scope both share.
 */
declare global {
  // eslint-disable-next-line no-var
  var __testValidationSchema: z.ZodTypeAny;
}

globalThis.__testValidationSchema = z.object({ answer: z.string().min(1) });

const ITEM_BUNDLE = `(async () => ({
  __runtimeVersion: 1,
  kind: 'FORM',
  language: 'en',
  tags: ['Test'],
  internal: { edition: 1, name: 'REPEATED_FORM' },
  content: {
    answer: { kind: 'string', label: 'Answer', variant: 'input' }
  },
  details: {
    description: 'A form administered twice by the series under test',
    license: 'Apache-2.0',
    title: 'Repeated Form'
  },
  measures: null,
  validationSchema: globalThis.__testValidationSchema
}))()`;

function createSeriesBundle({ skipProgress }: { skipProgress: boolean }) {
  return `(async () => ({
    __runtimeVersion: 1,
    kind: 'SERIES',
    language: 'en',
    tags: ['Test'],
    content: {
      items: [
        { name: 'REPEATED_FORM', edition: 1 },
        { name: 'REPEATED_FORM', edition: 1 }
      ],
      params: { skipProgress: ${skipProgress} }
    },
    details: {
      description: 'Administers the same form twice',
      license: 'Apache-2.0',
      title: 'Repeated Series'
    }
  }))()`;
}

/**
 * The two items are the same instrument, so the API serves them as byte-identical bundles — exactly
 * what `findBundleById` returns when a series names one instrument twice.
 */
function createTarget({ skipProgress }: { skipProgress: boolean }): SeriesInstrumentBundleContainer {
  return {
    bundle: createSeriesBundle({ skipProgress }),
    id: 'series-id',
    items: [
      { bundle: ITEM_BUNDLE, id: 'item-id', kind: 'FORM' },
      { bundle: ITEM_BUNDLE, id: 'item-id', kind: 'FORM' }
    ],
    kind: 'SERIES'
  };
}

function getAnswerInput(): HTMLInputElement {
  return screen.getByLabelText('Answer');
}

async function beginSeries({ skipProgress }: { skipProgress: boolean }) {
  const onSubmit = vi.fn();
  render(<SeriesInstrumentRenderer target={createTarget({ skipProgress })} onSubmit={onSubmit} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
  if (!skipProgress) {
    // Without `skipProgress`, the overview hands over to the interstitial screen rather than to the
    // first item, and that screen has a "Begin" of its own.
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
  }
  await waitFor(() => {
    expect(getAnswerInput()).toBeTruthy();
  });
  return { onSubmit };
}

async function answerAndSubmit(value: string, onSubmit: ReturnType<typeof vi.fn>) {
  const submissionCount = onSubmit.mock.calls.length;
  fireEvent.change(getAnswerInput(), { target: { value } });
  fireEvent.submit(screen.getByTestId('form-content'));
  await waitFor(() => {
    expect(onSubmit.mock.calls.length).toBe(submissionCount + 1);
  });
}

describe('SeriesInstrumentRenderer', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should present the next item of a skipProgress series with no answer filled in', async () => {
    const { onSubmit } = await beginSeries({ skipProgress: true });
    await answerAndSubmit('first administration', onSubmit);

    // No interstitial screen stands between the two items, so this is the second item rendered in
    // place of the first rather than a form the subject has navigated back to.
    await waitFor(() => {
      expect(getAnswerInput().value).toBe('');
    });
  });

  it('should submit the answer given to the next item, rather than the one carried over from the previous', async () => {
    const { onSubmit } = await beginSeries({ skipProgress: true });
    await answerAndSubmit('first administration', onSubmit);
    await waitFor(() => {
      expect(getAnswerInput().value).toBe('');
    });
    await answerAndSubmit('second administration', onSubmit);

    expect(onSubmit.mock.calls.map(([result]) => (result as { data: { answer: string } }).data.answer)).toEqual([
      'first administration',
      'second administration'
    ]);
  });

  it('should present an empty form after the interstitial screen when progress is not skipped', async () => {
    const { onSubmit } = await beginSeries({ skipProgress: false });
    await answerAndSubmit('first administration', onSubmit);

    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await waitFor(() => {
      expect(getAnswerInput().value).toBe('');
    });
  });
});
