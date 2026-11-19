import { expect } from '@playwright/test';
import type { FrameLocator, Locator, Page } from '@playwright/test';

import { playgroundURL } from '../../support/env';

/**
 * The playground editor. It is not an `apps/web` route, so this does not extend `RootPage` and is
 * not registered in `pageModels`; it navigates by absolute URL and needs no token.
 */
export class PlaygroundPage {
  readonly $ref: Page;
  /** The instrument list's search box, inside the popover {@link instrumentSelector} opens. */
  readonly instrumentSearch: Locator;
  /** The header's button that opens the instrument list. */
  readonly instrumentSelector: Locator;
  /** The instrument preview, which runs on another origin than the editor. */
  readonly preview: FrameLocator;
  readonly previewFrame: Locator;

  constructor(page: Page) {
    this.$ref = page;
    this.instrumentSelector = page.getByRole('combobox', { name: 'Load an instrument...' });
    this.instrumentSearch = page.getByPlaceholder('Search...');
    this.previewFrame = page.getByTestId('preview-frame');
    this.preview = page.frameLocator('[data-testid="preview-frame"]');
  }

  /** Opens the editor, or a share link built against {@link playgroundURL}. */
  async goto(url: string = playgroundURL): Promise<void> {
    await this.$ref.goto(url);
  }

  /** The option for the instrument with this label in the header's instrument list. */
  instrumentOption(label: string): Locator {
    return this.$ref.getByRole('option', { exact: true, name: label });
  }

  /** Opens the header's instrument list and types `query` into its search box. */
  async searchInstruments(query: string): Promise<void> {
    await this.instrumentSelector.click();
    await this.instrumentSearch.fill(query);
  }

  /** Picks an example or template from the header's instrument list by its label. */
  async selectInstrument(label: string): Promise<void> {
    await this.searchInstruments(label);
    await this.instrumentOption(label).click();
  }

  /**
   * Sets how often, in milliseconds, the viewer checks the editor's files for a change to compile,
   * through the header's User Settings dialog.
   */
  async setRefreshInterval(milliseconds: number): Promise<void> {
    await this.$ref.locator('button:has(svg.lucide-ellipsis-vertical)').click();
    await this.$ref.getByRole('menuitem', { name: 'User Settings' }).click();
    const dialog = this.$ref.getByRole('dialog');
    await dialog.getByLabel('Refresh Interval').fill(String(milliseconds));
    // libui labels every form's submit button "Submit" for assistive technology, whatever it reads.
    await dialog.getByRole('button', { name: 'Submit' }).click();
    await expect(dialog).toBeHidden();
  }
}
