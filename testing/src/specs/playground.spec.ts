import { generatePlaygroundURL } from '@opendatacapture/playground-url';

import { PlaygroundPage } from '../pages/playground/index.page';
import { playgroundURL } from '../support/env';
import { expect, test } from '../support/fixtures';

/**
 * A form whose module scope records where it ran: `ran` on its own document, and `escaped` on the
 * editor's, if the editor's document is reachable at all. From a separate origin that access throws.
 */
function probeInstrumentSource(title: string): string {
  return `
import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

document.body.dataset.probe = 'ran';
for (const target of [window.parent, window.top]) {
  try {
    target.document.body.dataset.probe = 'escaped';
  } catch {}
}

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  tags: ['Probe'],
  internal: { edition: 1, name: 'PROBE' },
  clientDetails: { estimatedDuration: 1, instructions: ['Probe'] },
  content: {},
  details: { description: 'Probe', license: 'Apache-2.0', title: '${title}' },
  measures: {},
  validationSchema: z.object({})
});
`;
}

/**
 * A form that shows its measures by default and has two computed measures, one of them marked hidden,
 * so the summary should list exactly the other one.
 */
function measureVisibilityInstrumentSource(title: string): string {
  return `
import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  tags: ['Measures'],
  internal: { edition: 1, name: 'MEASURE_VISIBILITY' },
  clientDetails: { estimatedDuration: 1, instructions: ['Submit the form'] },
  content: { note: { kind: 'string', label: 'Note', variant: 'input' } },
  defaultMeasureVisibility: 'visible',
  details: { description: 'Measure visibility', license: 'Apache-2.0', title: '${title}' },
  measures: {
    hiddenMeasure: { kind: 'computed', label: 'Hidden Measure', value: () => 1, visibility: 'hidden' },
    shownMeasure: { kind: 'computed', label: 'Shown Measure', value: () => 2 }
  },
  validationSchema: z.object({ note: z.string().optional() })
});
`;
}

/**
 * A form that asks for a pet's name only once the respondent says they have a pet. Both questions
 * carry a labeled measure, so the toggle's measure is always in the summary and the name's only when
 * the question was shown.
 */
function dynamicMeasureInstrumentSource(title: string): string {
  return `
import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  tags: ['Measures'],
  internal: { edition: 1, name: 'DYNAMIC_MEASURE' },
  clientDetails: { estimatedDuration: 1, instructions: ['Submit the form'] },
  content: {
    hasPet: { kind: 'boolean', label: 'Has Pet', variant: 'radio' },
    petName: {
      kind: 'dynamic',
      deps: ['hasPet'],
      render: (data) => (data.hasPet ? { kind: 'string', label: 'Pet Name', variant: 'input' } : null)
    }
  },
  defaultMeasureVisibility: 'visible',
  details: { description: 'Dynamic field measure', license: 'Apache-2.0', title: '${title}' },
  measures: {
    hasPet: { kind: 'const', label: 'Has Pet Measure', ref: 'hasPet' },
    petName: { kind: 'const', label: 'Pet Name Measure', ref: 'petName' }
  },
  validationSchema: z.object({ hasPet: z.boolean(), petName: z.string().optional() })
});
`;
}

// The first paint waits on the 11 MB esbuild download and the toolchain boot; the preview then
// compiles on a 2 s poll, so the whole chain is slower than the suite's default expect timeout.
const PREVIEW_TIMEOUT = 60_000;

test.describe('playground', () => {
  // Every page here boots esbuild-wasm and Monaco. Four at once, under the rest of the suite, has
  // starved a browser context of its start-up for longer than the test timeout.
  test.describe.configure({ mode: 'default' });
  test.slow();

  test('should run the preview on an origin other than the editor and render the instrument there @smoke', async ({
    page
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.goto();

    await expect(playground.previewFrame).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    const frameOrigin = new URL((await playground.previewFrame.getAttribute('src'))!).origin;
    expect(frameOrigin).not.toBe(new URL(page.url()).origin);

    await expect(playground.preview.getByRole('button', { name: 'Begin' })).toBeVisible({ timeout: PREVIEW_TIMEOUT });
  });

  test('should read the preview origin from the server at load, and refuse one equal to the editor', async ({
    page
  }) => {
    await page.route('**/config.json', (route) => route.fulfill({ json: { previewOrigin: playgroundURL } }));
    const playground = new PlaygroundPage(page);
    await playground.goto();

    await expect(page.getByRole('heading', { name: 'Preview Unavailable' })).toBeVisible({
      timeout: PREVIEW_TIMEOUT
    });
    await expect(playground.previewFrame).toHaveCount(0);
  });

  test("should run a share link's code without letting it reach the editor page", async ({ page, uniqueId }) => {
    const title = `Probe ${uniqueId}`;
    const playground = new PlaygroundPage(page);
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [{ content: probeInstrumentSource(title), name: 'index.ts' }],
        label: title
      })
    );

    await expect(playground.preview.getByRole('button', { name: 'Begin' })).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await expect(playground.preview.locator('body')).toHaveAttribute('data-probe', 'ran');
    await expect(page.locator('body')).not.toHaveAttribute('data-probe', /./);
  });

  // An interactive instrument renders in a frame of its own inside the preview, which reads its
  // parent's document. That only works because the preview is a real origin rather than an opaque
  // sandbox, which is the reason the preview is served from a second host.
  test('should render an interactive instrument inside the preview', async ({ page }) => {
    const playground = new PlaygroundPage(page);
    await playground.goto();
    await playground.selectInstrument('Interactive With React');

    await playground.preview.getByRole('button', { name: 'Begin' }).click({ timeout: PREVIEW_TIMEOUT });

    const task = playground.preview.frameLocator('iframe[name="interactive-instrument"]');
    await expect(task.getByRole('heading', { name: 'Vite + React' })).toBeVisible({ timeout: PREVIEW_TIMEOUT });
  });

  test('should hand a submission from the preview back to the editor', async ({ page }) => {
    const playground = new PlaygroundPage(page);
    await playground.goto();

    await playground.preview.getByRole('button', { name: 'Begin' }).click({ timeout: PREVIEW_TIMEOUT });
    // The editor reports the submission with `alert`, which blocks the page until it is dismissed,
    // so the click below only returns once the handler has closed it.
    const messages: string[] = [];
    page.once('dialog', (dialog) => {
      messages.push(dialog.message());
      void dialog.dismiss();
    });
    await playground.preview.getByRole('button', { name: 'Submit' }).click();

    await expect.poll(() => messages).toHaveLength(1);
    expect(messages[0]).toContain('The following data will be submitted');
  });

  // The preview validates every instrument it renders, and apps/web does too in development. That
  // validation is what used to strip `visibility` from computed measures, so the default applied.
  test('should leave a computed measure marked hidden out of the summary', async ({ page, uniqueId }) => {
    const title = `Measures ${uniqueId}`;
    const playground = new PlaygroundPage(page);
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [{ content: measureVisibilityInstrumentSource(title), name: 'index.ts' }],
        label: title
      })
    );

    await playground.preview.getByRole('button', { name: 'Begin' }).click({ timeout: PREVIEW_TIMEOUT });
    // Playwright dismisses the editor's submission `alert` on its own when nothing listens for it.
    await playground.preview.getByRole('button', { name: 'Submit' }).click();

    await expect(playground.preview.getByText('Shown Measure')).toBeVisible();
    await expect(playground.preview.getByText('Hidden Measure')).toHaveCount(0);
  });

  test('should leave the measure on a dynamic question the respondent never saw out of the summary', async ({
    page,
    uniqueId
  }) => {
    const title = `Dynamic Measure ${uniqueId}`;
    const playground = new PlaygroundPage(page);
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [{ content: dynamicMeasureInstrumentSource(title), name: 'index.ts' }],
        label: title
      })
    );

    await playground.preview.getByRole('button', { name: 'Begin' }).click({ timeout: PREVIEW_TIMEOUT });
    // The radio items carry stable ids (`<name>-true`), unlike their labels, which libui translates.
    await playground.preview.locator('#hasPet-false').click();
    await playground.preview.getByRole('button', { name: 'Submit' }).click();

    await expect(playground.preview.getByText('Has Pet Measure')).toBeVisible();
    await expect(playground.preview.getByText('Pet Name Measure')).toHaveCount(0);
  });

  test('should list the measure on a dynamic question in the summary once the respondent reveals it', async ({
    page,
    uniqueId
  }) => {
    const title = `Dynamic Measure ${uniqueId}`;
    const playground = new PlaygroundPage(page);
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [{ content: dynamicMeasureInstrumentSource(title), name: 'index.ts' }],
        label: title
      })
    );

    await playground.preview.getByRole('button', { name: 'Begin' }).click({ timeout: PREVIEW_TIMEOUT });
    await playground.preview.locator('#hasPet-true').click();
    await playground.preview.getByLabel('Pet Name', { exact: true }).fill('Rex');
    await playground.preview.getByRole('button', { name: 'Submit' }).click();

    await expect(playground.preview.getByText('Pet Name Measure')).toBeVisible();
  });
});
