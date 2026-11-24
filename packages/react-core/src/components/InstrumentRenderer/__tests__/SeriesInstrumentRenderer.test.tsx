import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { SeriesInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { SeriesInstrumentRenderer } from '../SeriesInstrumentRenderer';

import type { NavigationBlockerProps } from '../../NavigationBlockerDialog';

/**
 * A bundle is evaluated with `new Function`, so it can close over nothing in this file. The
 * validation schema is handed to it through `globalThis`, which is the one scope both share.
 */
declare global {
  var __testValidationSchema: z.ZodTypeAny;
  var __testInteractiveValidationSchema: z.ZodTypeAny;
  var __testRejectingSchema: z.ZodTypeAny;
  var __testSeriesParams: object;
}

globalThis.__testValidationSchema = z.object({ answer: z.string().min(1) });
globalThis.__testInteractiveValidationSchema = z.object({ message: z.string() });
globalThis.__testRejectingSchema = z.never();

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

function createInteractiveItemBundle({
  bilingual = false,
  content = '{}',
  schema = '__testInteractiveValidationSchema',
  withInternal = true
}: {
  bilingual?: boolean;
  content?: string;
  schema?: string;
  withInternal?: boolean;
} = {}) {
  return `(async () => ({
    __runtimeVersion: 1,
    kind: 'INTERACTIVE',
    language: ${bilingual ? "['en', 'fr']" : "'en'"},
    tags: ${bilingual ? "{ en: ['Test'], fr: ['Test'] }" : "['Test']"},
    ${withInternal ? "internal: { edition: 1, name: 'INTERACTIVE_ITEM' }," : ''}
    content: ${content},
    details: ${
      bilingual
        ? "{ description: { en: 'An interactive series item', fr: 'Un élément interactif' }, license: 'Apache-2.0', title: { en: 'Interactive Item', fr: 'Élément interactif' } }"
        : "{ description: 'An interactive series item', license: 'Apache-2.0', title: 'Interactive Item' }"
    },
    measures: null,
    validationSchema: globalThis.${schema}
  }))()`;
}

/**
 * A series whose params come from `globalThis.__testSeriesParams`, since the predicates in them are
 * functions and the bundle can close over nothing in this file.
 */
function createParamsTarget(itemBundles: string[]): SeriesInstrumentBundleContainer {
  return {
    bundle: `(async () => ({
      __runtimeVersion: 1,
      kind: 'SERIES',
      language: 'en',
      tags: ['Test'],
      content: { items: [], params: globalThis.__testSeriesParams },
      details: { description: 'A series under test', license: 'Apache-2.0', title: 'Series Under Test' }
    }))()`,
    id: 'series-id',
    items: itemBundles.map((bundle) => ({ bundle, id: 'item-id', kind: 'FORM' })),
    kind: 'SERIES'
  };
}

async function finishInteractiveItem(detail: unknown = { message: 'ok' }) {
  await waitFor(() => {
    expect(document.querySelector('iframe')).toBeTruthy();
  });
  await act(async () => {
    document.dispatchEvent(new CustomEvent('done', { detail }));
    await Promise.resolve();
  });
}

const NavigationBlocker = vi.fn((_props: NavigationBlockerProps) => null);

function isNavigationBlocked() {
  return NavigationBlocker.mock.lastCall?.[0].active;
}

async function beginSeries({ skipProgress }: { skipProgress: boolean }) {
  const onSubmit = vi.fn();
  render(
    <SeriesInstrumentRenderer
      NavigationBlocker={NavigationBlocker}
      target={createTarget({ skipProgress })}
      onSubmit={onSubmit}
    />
  );
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

function getProgressBar() {
  return screen.getByRole('progressbar', { name: 'Series progress' });
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

  afterEach(() => {
    cleanup();
    i18n.changeLanguage('en');
    NavigationBlocker.mockClear();
    Reflect.deleteProperty(HTMLElement.prototype, 'requestFullscreen');
    vi.restoreAllMocks();
    useNotificationsStore.setState({ notifications: [] });
    Reflect.deleteProperty(globalThis, '__testSeriesParams');
  });

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

  it('should show the completion screen once every item has been submitted', async () => {
    const { onSubmit } = await beginSeries({ skipProgress: true });
    await answerAndSubmit('first administration', onSubmit);
    await waitFor(() => {
      expect(getAnswerInput().value).toBe('');
    });
    await answerAndSubmit('second administration', onSubmit);

    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeTruthy();
    });
  });

  it('should keep blocking navigation between items, so leaving cannot abandon the series partway', async () => {
    const { onSubmit } = await beginSeries({ skipProgress: false });
    await answerAndSubmit('first administration', onSubmit);
    await screen.findByText('Series Instrument in Progress');
    expect(isNavigationBlocked()).toBe(true);
  });

  it('should stop blocking navigation once every item has been submitted', async () => {
    const { onSubmit } = await beginSeries({ skipProgress: true });
    await answerAndSubmit('first administration', onSubmit);
    await waitFor(() => {
      expect(getAnswerInput().value).toBe('');
    });
    await answerAndSubmit('second administration', onSubmit);
    await screen.findByText('Thank You!');
    expect(isNavigationBlocked()).toBe(false);
  });

  it('should show a placeholder when an item bundle fails to interpret', async () => {
    const target: SeriesInstrumentBundleContainer = {
      bundle: `(async () => ({
        __runtimeVersion: 1,
        kind: 'SERIES',
        language: 'en',
        tags: ['Test'],
        content: { items: [{ name: 'BROKEN', edition: 1 }], params: { skipProgress: true } },
        details: { description: 'A series with a broken item', license: 'Apache-2.0', title: 'Broken Series' }
      }))()`,
      id: 'series-id',
      items: [{ bundle: "(() => { throw new Error('boom'); })()", id: 'item-id', kind: 'FORM' }],
      kind: 'SERIES'
    };
    render(<SeriesInstrumentRenderer target={target} onSubmit={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await waitFor(() => {
      expect(screen.getByText('Failed to Load Instrument')).toBeTruthy();
    });
  });

  it('should render an INTERACTIVE item, and complete the series when it submits', async () => {
    const interactiveItemBundle = `(async () => ({
      __runtimeVersion: 1,
      kind: 'INTERACTIVE',
      language: 'en',
      tags: ['Test'],
      internal: { edition: 1, name: 'INTERACTIVE_ITEM' },
      content: {},
      details: { description: 'An interactive series item', license: 'Apache-2.0', title: 'Interactive Item' },
      measures: null,
      validationSchema: globalThis.__testInteractiveValidationSchema
    }))()`;
    const target: SeriesInstrumentBundleContainer = {
      bundle: `(async () => ({
        __runtimeVersion: 1,
        kind: 'SERIES',
        language: 'en',
        tags: ['Test'],
        content: { items: [{ name: 'INTERACTIVE_ITEM', edition: 1 }], params: { skipProgress: true } },
        details: { description: 'A series with one interactive item', license: 'Apache-2.0', title: 'Interactive Series' }
      }))()`,
      id: 'series-id',
      items: [{ bundle: interactiveItemBundle, id: 'item-id', kind: 'INTERACTIVE' }],
      kind: 'SERIES'
    };
    const onSubmit = vi.fn();
    render(<SeriesInstrumentRenderer target={target} onSubmit={onSubmit} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await waitFor(() => {
      expect(document.querySelector('iframe')).toBeTruthy();
    });
    await act(async () => {
      document.dispatchEvent(new CustomEvent('done', { detail: { message: 'ok' } }));
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeTruthy();
    });
  });

  it('should show the language selection screen for an interactive item that enables it, as the scalar renderer does', async () => {
    globalThis.__testSeriesParams = { skipProgress: true };
    const item = createInteractiveItemBundle({ bilingual: true, content: '{ enableLanguageSelect: true }' });
    render(<SeriesInstrumentRenderer target={createParamsTarget([item])} onSubmit={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    expect(await screen.findByText('Select Language')).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Français/ }));
    const iframe = await screen.findByTitle('Open Data Capture - Interactive Instrument');
    expect(iframe.getAttribute('lang')).toBe('fr');
  });

  it('should skip the language selection screen for an interactive item when the host names a language', async () => {
    globalThis.__testSeriesParams = { skipProgress: true };
    const item = createInteractiveItemBundle({ bilingual: true, content: '{ enableLanguageSelect: true }' });
    render(<SeriesInstrumentRenderer language="fr" target={createParamsTarget([item])} onSubmit={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    const iframe = await screen.findByTitle('Open Data Capture - Interactive Instrument');
    expect(iframe.getAttribute('lang')).toBe('fr');
    expect(screen.queryByText('Select Language')).toBeNull();
  });

  it('should hold a locked interactive item in its language when the interface language changes', async () => {
    globalThis.__testSeriesParams = { skipProgress: true };
    const item = createInteractiveItemBundle({ bilingual: true, content: '{ enableLanguageLock: true }' });
    render(<SeriesInstrumentRenderer target={createParamsTarget([item])} onSubmit={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await screen.findByTitle('Open Data Capture - Interactive Instrument');
    act(() => i18n.changeLanguage('fr'));
    const iframe = await screen.findByTitle('Open Data Capture - Interactive Instrument');
    expect(iframe.getAttribute('lang')).toBe('en');
  });

  it('should release a locked item language when advancing, so an unlocked next item follows the interface', async () => {
    globalThis.__testSeriesParams = { skipProgress: true };
    const lockedItem = createInteractiveItemBundle({ bilingual: true, content: '{ enableLanguageLock: true }' });
    const unlockedItem = createInteractiveItemBundle({ bilingual: true });
    render(<SeriesInstrumentRenderer target={createParamsTarget([lockedItem, unlockedItem])} onSubmit={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await screen.findByTitle('Open Data Capture - Interactive Instrument');
    act(() => i18n.changeLanguage('fr'));
    await finishInteractiveItem();
    await waitFor(() => {
      expect(screen.getByTitle('Open Data Capture - Interactive Instrument').getAttribute('lang')).toBe('fr');
    });
  });

  it('should switch the interface language again from the next item after a locked item finishes', async () => {
    globalThis.__testSeriesParams = { skipProgress: true };
    const item = createInteractiveItemBundle({
      bilingual: true,
      content: '{ enableLanguageLock: true, enableLanguageSelect: true }'
    });
    render(<SeriesInstrumentRenderer target={createParamsTarget([item, item])} onSubmit={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    fireEvent.click(await screen.findByRole('button', { name: /Français/ }));
    await finishInteractiveItem();
    fireEvent.click(await screen.findByRole('button', { name: /English/ }));
    await screen.findByTitle('Open Data Capture - Interactive Instrument');
    expect(i18n.resolvedLanguage).toBe('en');
  });

  it('should enter fullscreen and offer the language toggle for an interactive item that enables them', async () => {
    const requestFullscreen = vi.fn(() => Promise.resolve());
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { configurable: true, value: requestFullscreen });
    globalThis.__testSeriesParams = { skipProgress: true };
    const item = createInteractiveItemBundle({
      bilingual: true,
      content: '{ defaultFullscreen: true, enableLanguageToggle: true }'
    });
    render(<SeriesInstrumentRenderer target={createParamsTarget([item])} onSubmit={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    const iframe = await screen.findByTitle('Open Data Capture - Interactive Instrument');
    expect(requestFullscreen.mock.contexts[0]).toBe(iframe);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(3);
  });

  it('should show a placeholder when the series bundle itself fails to interpret', async () => {
    const target = { ...createTarget({ skipProgress: true }), bundle: "(() => { throw new Error('boom'); })()" };
    render(<SeriesInstrumentRenderer target={target} onSubmit={vi.fn()} />);
    expect(await screen.findByText('Failed to Load Instrument')).toBeTruthy();
  });

  it('should resume at the initial series index, counting the earlier items as completed', async () => {
    render(
      <SeriesInstrumentRenderer
        initialSeriesIndex={1}
        target={createTarget({ skipProgress: false })}
        onSubmit={vi.fn()}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    expect(await screen.findByText('Instrument 2 of 2')).toBeTruthy();
    expect(getProgressBar().getAttribute('aria-valuenow')).toBe('1');
  });

  it('should show progress on the form screen of a skipProgress series, which has no interstitial to show it', async () => {
    const { onSubmit } = await beginSeries({ skipProgress: true });
    expect(screen.getByText('Instrument 1 of 2')).toBeTruthy();
    expect(getProgressBar().getAttribute('aria-valuenow')).toBe('0');
    await answerAndSubmit('first administration', onSubmit);
    expect(await screen.findByText('Instrument 2 of 2')).toBeTruthy();
    expect(getProgressBar().getAttribute('aria-valuenow')).toBe('1');
  });

  it('should show no progress on the overview screen, before any item is administered', async () => {
    render(<SeriesInstrumentRenderer target={createTarget({ skipProgress: true })} onSubmit={vi.fn()} />);
    await screen.findByRole('button', { name: 'Begin' });
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('should show no progress on the completion screen, once every item is administered', async () => {
    const { onSubmit } = await beginSeries({ skipProgress: true });
    await answerAndSubmit('first administration', onSubmit);
    await waitFor(() => {
      expect(getAnswerInput().value).toBe('');
    });
    await answerAndSubmit('second administration', onSubmit);
    await screen.findByText('Thank You!');
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('should refuse an initial series index past the last item', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => {
      return render(
        <SeriesInstrumentRenderer
          initialSeriesIndex={2}
          target={createTarget({ skipProgress: true })}
          onSubmit={vi.fn()}
        />
      );
    }).toThrow("Initial series index '2' must be less than length of items '2'");
  });

  it('should refuse an item submission its validation schema rejects, rather than pass invalid data on', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    globalThis.__testSeriesParams = { skipProgress: true };
    const onSubmit = vi.fn();
    render(
      <SeriesInstrumentRenderer
        target={createParamsTarget([createInteractiveItemBundle({ schema: '__testRejectingSchema' })])}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await finishInteractiveItem();
    await waitFor(() => {
      expect(useNotificationsStore.getState().notifications).toMatchObject([
        { message: expect.stringContaining('The information submitted is invalid'), type: 'error' }
      ]);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should end the series early when its terminate predicate says so, marking the submission complete', async () => {
    const terminate = vi.fn(() => true);
    globalThis.__testSeriesParams = { skipProgress: true, terminate };
    const onSubmit = vi.fn();
    render(<SeriesInstrumentRenderer target={createParamsTarget([ITEM_BUNDLE, ITEM_BUNDLE])} onSubmit={onSubmit} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await waitFor(() => {
      expect(getAnswerInput()).toBeTruthy();
    });
    await answerAndSubmit('stop here', onSubmit);
    expect(await screen.findByText('Thank You!')).toBeTruthy();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ complete: true }));
    expect(terminate).toHaveBeenCalledWith({ answer: 'stop here' }, { itemIndex: 0, itemName: 'REPEATED_FORM' });
  });

  it('should give the terminate predicate an empty item name for an item that declares none', async () => {
    const terminate = vi.fn(() => false);
    globalThis.__testSeriesParams = { skipProgress: true, terminate };
    render(
      <SeriesInstrumentRenderer
        target={createParamsTarget([createInteractiveItemBundle({ withInternal: false })])}
        onSubmit={vi.fn()}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await finishInteractiveItem();
    await waitFor(() => {
      expect(terminate).toHaveBeenCalledWith({ message: 'ok' }, { itemIndex: 0, itemName: '' });
    });
  });

  it('should show the completion message the series supplies once it is complete', async () => {
    globalThis.__testSeriesParams = {
      completionMessage: () => ({ en: 'All done, thank you', fr: 'Tout est fait, merci' }),
      skipProgress: true
    };
    render(
      <SeriesInstrumentRenderer target={createParamsTarget([createInteractiveItemBundle()])} onSubmit={vi.fn()} />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    await finishInteractiveItem();
    expect(await screen.findByText('All done, thank you')).toBeTruthy();
  });

  it('should render no content for an item of a kind a series cannot administer', async () => {
    globalThis.__testSeriesParams = { skipProgress: true };
    const fileItemBundle = createInteractiveItemBundle().replace("kind: 'INTERACTIVE'", "kind: 'FILE'");
    const { container } = render(
      <SeriesInstrumentRenderer target={createParamsTarget([fileItemBundle])} onSubmit={vi.fn()} />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
    // The container's only children left are its step header and the progress bar once the content
    // area renders nothing, which a spinner, form, iframe or error placeholder would each add to.
    await waitFor(() => {
      expect(container.firstElementChild?.childElementCount).toBe(2);
    });
    expect(container.querySelector('.animate-spinner, form, iframe')).toBeNull();
    expect(screen.queryByText('Failed to Load Instrument')).toBeNull();
  });
});
