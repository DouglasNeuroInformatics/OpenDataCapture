// @vitest-environment happy-dom

import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root as ReactRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { encodeUnicodeToBase64 } from '@opendatacapture/runtime-internal';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { Root } from '../root';

/**
 * A bundle is evaluated with `new Function`, so it can close over nothing in this file. The
 * validation schema is handed to it through `globalThis`, which is the one scope both share.
 */
declare global {
  var __serveInstrumentValidationSchema: z.ZodTypeAny;
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.__serveInstrumentValidationSchema = z.object({});

const BUNDLE = "(async () => ({ kind: 'FORM', language: 'en', content: {}, details: { title: 'Stub' } }))()";

const SUBMITTABLE_BUNDLE = `(async () => ({
  __runtimeVersion: 1,
  kind: 'FORM',
  language: 'en',
  tags: ['Test'],
  internal: { edition: 1, name: 'STUB_FORM' },
  content: {},
  details: {
    description: 'A form under test',
    license: 'Apache-2.0',
    title: 'Stub Form'
  },
  measures: null,
  validationSchema: globalThis.__serveInstrumentValidationSchema
}))()`;

const mountedRoots: ReactRoot[] = [];

function renderIntoDocument(element: ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  act(() => root.render(element));
  return { container, root };
}

function getButtonByText(container: HTMLElement, text: string) {
  const button = Array.from(container.querySelectorAll('button')).find((element) => element.textContent === text);
  if (!button) {
    throw new Error(`No button with text '${text}'`);
  }
  return button;
}

async function submitInstrument(container: HTMLElement) {
  await vi.waitFor(() => getButtonByText(container, 'Begin'));
  act(() => getButtonByText(container, 'Begin').click());
  await vi.waitFor(() => {
    expect(container.querySelector('form')).toBeTruthy();
  });
  act(() => container.querySelector('form')!.requestSubmit());
}

describe('Root', () => {
  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    for (const root of mountedRoots.splice(0)) {
      act(() => root.unmount());
    }
    document.body.innerHTML = '';
    act(() => i18n.changeLanguage('en'));
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

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

  it('should highlight the language picked from the switcher, so the reader sees which one is active', () => {
    const { container } = renderIntoDocument(<Root instruments={[]} page="index" />);
    act(() => getButtonByText(container, 'fr').click());
    expect(getButtonByText(container, 'fr').className).toContain('font-bold');
    expect(getButtonByText(container, 'en').className).not.toContain('font-bold');
  });

  it('should stop listening for language changes once unmounted, so a gone switcher holds no handler', () => {
    const addEventListener = vi.spyOn(i18n, 'addEventListener');
    const removeEventListener = vi.spyOn(i18n, 'removeEventListener');
    const { root } = renderIntoDocument(<Root instruments={[]} page="index" />);
    act(() => root.unmount());
    expect(removeEventListener).toHaveBeenCalledWith('languageChange', addEventListener.mock.lastCall?.[1]);
  });

  it('should alert the submitted data on the single-instrument page, since there is no backend to send it to', async () => {
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    const { container } = renderIntoDocument(
      <Root encodedBundle={encodeUnicodeToBase64(SUBMITTABLE_BUNDLE)} page="single" />
    );
    await submitInstrument(container);
    await vi.waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('The following data will be submitted'));
    });
  });

  it('should alert the submitted data on an instrument page, since there is no backend to send it to', async () => {
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    const { container } = renderIntoDocument(
      <Root
        encodedBundle={encodeUnicodeToBase64(SUBMITTABLE_BUNDLE)}
        instrumentName="happiness"
        instrumentType="forms"
        page="instrument"
      />
    );
    await submitInstrument(container);
    await vi.waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('The following data will be submitted'));
    });
  });
});
