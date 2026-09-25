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
});
