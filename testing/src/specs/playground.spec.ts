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

/** 1×1 PNG. The playground stores binary assets as base64 and decodes them before bundling. */
const STIM_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * An interactive instrument that paints an imported PNG. The extension stays upper case: that is
 * the filename shape the playground bundles when it renders this preview.
 */
function uppercasePngInstrumentSource(title: string): string {
  return `
import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

import stim from './stim.PNG';

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: 'en',
  tags: ['Stimulus'],
  internal: { edition: 1, name: 'UPPERCASE_PNG' },
  clientDetails: { estimatedDuration: 1, instructions: ['Look at the image'] },
  content: {
    render() {
      const image = document.createElement('img');
      image.alt = 'Stimulus';
      image.src = stim;
      image.width = 32;
      image.height = 32;
      document.body.appendChild(image);
    }
  },
  details: { description: 'Upper-case PNG import', license: 'Apache-2.0', title: '${title}' },
  measures: {},
  validationSchema: z.object({})
});
`;
}

// The first paint waits on the 13 MB esbuild download and the toolchain boot; the preview then
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

  test('should render a share link that imports an upper-case PNG, so the preview shows the stimulus', async ({
    page,
    uniqueId
  }) => {
    const title = `Upper PNG ${uniqueId}`;
    const playground = new PlaygroundPage(page);
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [
          { content: uppercasePngInstrumentSource(title), name: 'index.ts' },
          { content: STIM_PNG_BASE64, name: 'stim.PNG' }
        ],
        label: title
      })
    );

    await expect(playground.preview.getByRole('heading', { name: title })).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await playground.preview.getByRole('button', { name: 'Begin' }).click();

    const stimulus = playground.preview
      .frameLocator('iframe[name="interactive-instrument"]')
      .getByRole('img', { name: 'Stimulus' });
    await expect(stimulus).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await expect(stimulus).toHaveAttribute('src', `data:image/png;base64,${STIM_PNG_BASE64}`);
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

test.describe('playground interactive examples', () => {
  test.describe.configure({ mode: 'default' });
  test.slow();

  for (const label of ['Interactive With Static Assets', 'Interactive With Legacy Script']) {
    test(`should submit the ${label} example when its Submit button is clicked`, async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.goto();
      await playground.selectInstrument(label);

      await playground.preview.getByRole('button', { name: 'Begin' }).click({ timeout: PREVIEW_TIMEOUT });
      const messages: string[] = [];
      page.once('dialog', (dialog) => {
        messages.push(dialog.message());
        void dialog.dismiss();
      });
      const task = playground.preview.frameLocator('iframe[name="interactive-instrument"]');
      await task.getByRole('button', { name: 'Submit' }).click({ timeout: PREVIEW_TIMEOUT });

      await expect.poll(() => messages).toHaveLength(1);
      expect(messages[0]).toContain('"message": "Hello"');
    });
  }
});

test.describe('playground save button', () => {
  test.describe.configure({ mode: 'default' });
  test.slow();

  test('should disable Save after switching from an edited saved instrument to an example', async ({
    page,
    uniqueId
  }) => {
    const title = `Save ${uniqueId}`;
    const playground = new PlaygroundPage(page);
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [{ content: measureVisibilityInstrumentSource(title), name: 'index.ts' }],
        label: title
      })
    );
    await expect(playground.preview.getByRole('heading', { name: title })).toBeVisible({ timeout: PREVIEW_TIMEOUT });

    const saveButton = page.locator('button:has(svg.lucide-save)');
    await page.locator('.monaco-editor .view-lines').click();
    await page.keyboard.type('// edited');
    await expect(saveButton).toBeEnabled();

    await playground.selectInstrument('Form Reference');
    await expect(saveButton).toBeDisabled();
  });
});

test.describe('playground editor tabs', () => {
  test.describe.configure({ mode: 'default' });
  test.slow();

  test('should keep the active tab selected when a background tab is closed', async ({ page, uniqueId }) => {
    const title = `Tabs ${uniqueId}`;
    const playground = new PlaygroundPage(page);
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [
          { content: measureVisibilityInstrumentSource(title), name: 'index.ts' },
          { content: 'export const a = 1;', name: 'a.ts' },
          { content: 'export const b = 2;', name: 'b.ts' }
        ],
        label: title
      })
    );
    await expect(playground.preview.getByRole('heading', { name: title })).toBeVisible({ timeout: PREVIEW_TIMEOUT });

    await page.locator('button:has(svg.lucide-columns-3)').click();
    const fileButton = (filename: string) =>
      page.locator('button', { has: page.locator(`input[value="${filename}"]`) });
    await fileButton('a.ts').click();
    await fileButton('b.ts').click();

    const tab = (filename: string) => page.locator('button[aria-current]', { hasText: filename });
    await expect(tab('b.ts')).toHaveAttribute('aria-current', 'true');

    await tab('a.ts').locator('svg.lucide-x').click();
    await expect(tab('a.ts')).toHaveCount(0);
    await expect(tab('b.ts')).toHaveAttribute('aria-current', 'true');
  });
});

test.describe('playground instrument deletion', () => {
  test.describe.configure({ mode: 'default' });
  test.slow();

  test('should show the default template after the selected saved instrument is deleted', async ({
    page,
    uniqueId
  }) => {
    const title = `Deleted ${uniqueId}`;
    const playground = new PlaygroundPage(page);
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [{ content: measureVisibilityInstrumentSource(title), name: 'index.ts' }],
        label: title
      })
    );
    await expect(playground.preview.getByRole('heading', { name: title })).toBeVisible({ timeout: PREVIEW_TIMEOUT });

    await page.locator('button:has(svg.lucide-ellipsis-vertical)').click();
    await page.getByRole('menuitem', { name: 'Delete Instrument' }).click();
    await page.getByRole('dialog').getByRole('button', { exact: true, name: 'Delete' }).click();

    await expect(playground.preview.getByRole('heading', { name: '<PLACEHOLDER>' })).toBeVisible({
      timeout: PREVIEW_TIMEOUT
    });
    await expect(playground.preview.getByRole('heading', { name: title })).toHaveCount(0);
  });
});
