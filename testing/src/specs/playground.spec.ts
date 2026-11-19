import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

import { generatePlaygroundURL } from '@opendatacapture/playground-url';
import type { Page } from '@playwright/test';

import { PlaygroundPage } from '../pages/playground/index.page';
import { playgroundURL } from '../support/env';
import { expect, test } from '../support/fixtures';

const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');

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

/** A form whose title includes a value imported from a subpath of the scoped runtime-core package. */
function scopedSubpathInstrumentSource(title: string): string {
  return `
import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { FILE_TYPES } from '/runtime/v1/@opendatacapture/runtime-core/constants';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  tags: ['Constants'],
  internal: { edition: 1, name: 'SCOPED_SUBPATH' },
  clientDetails: { estimatedDuration: 1, instructions: ['Submit the form'] },
  content: {},
  details: { description: 'Scoped subpath import', license: 'Apache-2.0', title: \`${title} \${FILE_TYPES.images[0]}\` },
  measures: {},
  validationSchema: z.object({})
});
`;
}

/**
 * An SVG with a bare `%` and a `#` on a child. esbuild emits it as percent-encoded text
 * (`data:image/svg+xml,<svg …>`) that escapes `#` but leaves the `%`, which only a lenient,
 * Fetch-spec decoder turns back into the original markup.
 */
const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="100%" height="100%" fill="#0a0"/></svg>';

/**
 * An interactive instrument whose HTML loads an SVG through `staticAssets`, so the image is served
 * by the interactive service worker rather than set from the data URL directly.
 */
function staticSvgInstrumentSource(title: string): string {
  return `
import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

import icon from './icon.svg';

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: 'en',
  tags: ['Stimulus'],
  internal: { edition: 1, name: 'STATIC_SVG' },
  clientDetails: { estimatedDuration: 1, instructions: ['Look at the image'] },
  content: {
    html: '<img alt="Icon" src="icon.svg">',
    render() {},
    staticAssets: { '/icon.svg': icon }
  },
  details: { description: 'SVG static asset', license: 'Apache-2.0', title: '${title}' },
  measures: {},
  validationSchema: z.object({})
});
`;
}

const JSPSYCH_EXAMPLE_DIR = path.join(
  REPO_ROOT,
  'apps/playground/src/instruments/examples/interactive/Interactive-With-JSPsych'
);

/**
 * The JSPsych example, with the waits its timeline spends in real time cut short: a random fixation
 * of up to 2 s before each of its ten trials, and a 2 s gap after the instructions. Everything the
 * task submits is left as it is. Throws if the example no longer contains what is replaced, so the
 * test cannot silently fall back to the full-length timeline.
 */
function shortenedJsPsychSource(): string {
  let source = readFileSync(path.join(JSPSYCH_EXAMPLE_DIR, 'index.ts'), 'utf-8');
  for (const [from, to] of [
    [
      'sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)',
      'sampleWithoutReplacement([250], 1)'
    ],
    ['post_trial_gap: 2000', 'post_trial_gap: 0']
  ] as const) {
    if (!source.includes(from)) {
      throw new Error(`Expected the JSPsych example to contain '${from}'`);
    }
    source = source.replace(from, to);
  }
  return source;
}

/** Runs `action`, which must make the editor raise an `alert`, and returns what the alert said. */
async function readAlert(page: Page, action: () => Promise<void>): Promise<string> {
  // The editor reports a submission with `alert`, which blocks the page until it is dismissed.
  const message = new Promise<string>((resolve) => {
    page.once('dialog', (dialog) => {
      resolve(dialog.message());
      void dialog.dismiss();
    });
  });
  await action();
  return message;
}

// The viewer compiles once it sees the editor's files change, on a poll of `refreshInterval`, which
// defaults to 2 s. The suite sets it lower so that each new instrument is compiled sooner.
const PREVIEW_REFRESH_INTERVAL = 250;

// The page boots on the 13 MB esbuild download and the toolchain, which together are slower than the
// suite's default expect timeout.
const PREVIEW_TIMEOUT = 60_000;

/** The `details.title` of the examples picked from the instrument list, which each preview shows. */
const EXAMPLE_TITLES = {
  'Interactive With Legacy Script': 'Interactive Instrument With Legacy Script',
  'Interactive With Static Assets': 'Interactive Instrument with Static Assets'
};

test.describe('playground', () => {
  // Every playground page boots esbuild-wasm and Monaco and takes about 1 GB, so the tests share one
  // and load each instrument into it. A share link differs from the page's URL only in its
  // fragment, which the editor reads on `hashchange`, so opening one does not reload the page. As
  // the previous test's preview is still on screen until the next instrument compiles, each test
  // waits for its own instrument's title before acting.
  test.describe.configure({ mode: 'default' });
  test.slow();

  let playground: PlaygroundPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(PREVIEW_TIMEOUT * 2);
    playground = new PlaygroundPage(await browser.newPage());
    await playground.goto();
    await playground.setRefreshInterval(PREVIEW_REFRESH_INTERVAL);
  });

  test.afterAll(async () => {
    await playground.$ref.close();
  });

  // This test reads the default instrument the page opened on, so it must run first.
  test('should run the default instrument on a preview origin of its own, and hand its submission back to the editor', async () => {
    await expect(playground.previewFrame).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    const frameOrigin = new URL((await playground.previewFrame.getAttribute('src'))!).origin;
    expect(frameOrigin).not.toBe(new URL(playground.$ref.url()).origin);

    await playground.preview.getByRole('button', { name: 'Begin' }).click({ timeout: PREVIEW_TIMEOUT });
    const message = await readAlert(playground.$ref, () => {
      return playground.preview.getByRole('button', { name: 'Submit' }).click();
    });
    expect(message).toContain('The following data will be submitted');
  });

  test("should run a share link's code without letting it reach the editor page", async ({ uniqueId }) => {
    const title = `Probe ${uniqueId}`;
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [{ content: probeInstrumentSource(title), name: 'index.ts' }],
        label: title
      })
    );

    await expect(playground.preview.getByRole('heading', { name: title })).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await expect(playground.preview.locator('body')).toHaveAttribute('data-probe', 'ran');
    await expect(playground.$ref.locator('body')).not.toHaveAttribute('data-probe', /./);
  });

  test('should serve an SVG static asset through the service worker, so the image in its HTML loads', async ({
    uniqueId
  }) => {
    const title = `Static SVG ${uniqueId}`;
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [
          { content: staticSvgInstrumentSource(title), name: 'index.ts' },
          { content: ICON_SVG, name: 'icon.svg' }
        ],
        label: title
      })
    );

    await expect(playground.preview.getByRole('heading', { name: title })).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await playground.preview.getByRole('button', { name: 'Begin' }).click();

    const icon = playground.preview
      .frameLocator('iframe[name="interactive-instrument"]')
      .getByRole('img', { name: 'Icon' });
    await expect(icon).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await expect
      .poll(() => icon.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth), {
        timeout: PREVIEW_TIMEOUT
      })
      .toBeGreaterThan(0);
  });

  // `test:e2e` builds `@opendatacapture/playground-url` first, so its CLI is in `dist`. The React
  // example imports `react.svg`; the CLI used to skip it as binary, so the link failed to compile.
  // The task renders in a frame of its own inside the preview, which reads its parent's document:
  // that only works because the preview is a real origin rather than an opaque sandbox.
  test('should render the React example and its SVG asset from a link generated by the playground-url CLI', async () => {
    const href = execFileSync(
      process.execPath,
      [
        path.join(REPO_ROOT, 'packages/playground-url/dist/cli.js'),
        path.join(REPO_ROOT, 'apps/playground/src/instruments/examples/interactive/Interactive-With-React'),
        '--base-url',
        playgroundURL
      ],
      { encoding: 'utf-8' }
    ).trim();
    await playground.goto(href);

    await expect(playground.preview.getByRole('heading', { name: 'React Click Task' })).toBeVisible({
      timeout: PREVIEW_TIMEOUT
    });
    await playground.preview.getByRole('button', { name: 'Begin' }).click();

    const task = playground.preview.frameLocator('iframe[name="interactive-instrument"]');
    await expect(task.getByRole('heading', { name: 'Vite + React' })).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    // A visibility check would also pass for an SVG that arrives base64-encoded and renders broken.
    const logo = task.getByRole('img', { name: 'React logo' });
    await expect(logo).toBeVisible();
    await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  });

  test('should load a subpath of a scoped runtime package, so its exports reach the instrument', async ({
    uniqueId
  }) => {
    const title = `Scoped Subpath ${uniqueId}`;
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [{ content: scopedSubpathInstrumentSource(title), name: 'index.ts' }],
        label: title
      })
    );

    await expect(playground.preview.getByRole('heading', { name: `${title} image/png` })).toBeVisible({
      timeout: PREVIEW_TIMEOUT
    });
  });

  for (const [label, title] of Object.entries(EXAMPLE_TITLES)) {
    test(`should submit the ${label} example when its Submit button is clicked`, async () => {
      await playground.selectInstrument(label);

      await expect(playground.preview.getByRole('heading', { name: title })).toBeVisible({
        timeout: PREVIEW_TIMEOUT
      });
      await playground.preview.getByRole('button', { name: 'Begin' }).click();
      const task = playground.preview.frameLocator('iframe[name="interactive-instrument"]');
      const message = await readAlert(playground.$ref, () => {
        return task.getByRole('button', { name: 'Submit' }).click({ timeout: PREVIEW_TIMEOUT });
      });
      expect(message).toContain('"message": "Hello"');
    });
  }

  // The task only submits once the respondent has pressed through every trial, and the preview
  // reports a submission only if it passes the example's own schema, an array of trials.
  test('should submit the JSPsych example once its timeline finishes', async ({ uniqueId }) => {
    const title = `JSPsych ${uniqueId}`;
    await playground.goto(
      generatePlaygroundURL({
        baseURL: playgroundURL,
        files: [
          { content: shortenedJsPsychSource(), name: 'index.ts' },
          // The playground holds binary assets as base64, which is what a share link carries.
          ...['blue.png', 'orange.png'].map((name) => ({
            content: readFileSync(path.join(JSPSYCH_EXAMPLE_DIR, name)).toString('base64'),
            name
          }))
        ],
        label: title
      })
    );

    await expect(playground.preview.getByRole('heading', { name: 'Reaction Time Task' })).toBeVisible({
      timeout: PREVIEW_TIMEOUT
    });
    await playground.preview.getByRole('button', { name: 'Begin' }).click();
    const task = playground.preview.frameLocator('iframe[name="interactive-instrument"]');
    const body = task.locator('body');

    await expect(task.getByText('Welcome to the experiment.')).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await body.press('Space');
    await expect(task.getByText('In this experiment, a circle will appear')).toBeVisible();
    await body.press('Space');

    // 2 stimuli x 5 repetitions, each shown after its fixation
    const stimulus = task.locator('#jspsych-image-keyboard-response-stimulus');
    for (let trial = 0; trial < 10; trial++) {
      await expect(stimulus).toBeVisible();
      await body.press('f');
      await expect(stimulus).toBeHidden();
    }

    await expect(task.getByText('Press any key to complete the experiment.')).toBeVisible();
    const message = await readAlert(playground.$ref, () => body.press('Space'));
    expect(message).toContain('The following data will be submitted');
    // the dialog text is cut short (the trials embed the stimuli as data URLs), so only its start is checked
    expect(message).toContain('"data": [');
  });
});
