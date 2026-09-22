import type { FrameLocator, Locator, Page } from '@playwright/test';

import { playgroundURL } from '../../support/env';

/**
 * The playground editor. It is not an `apps/web` route, so this does not extend `RootPage` and is
 * not registered in `pageModels`; it navigates by absolute URL and needs no token.
 */
export class PlaygroundPage {
  readonly $ref: Page;
  /** The instrument preview, which runs on another origin than the editor. */
  readonly preview: FrameLocator;
  readonly previewFrame: Locator;

  constructor(page: Page) {
    this.$ref = page;
    this.previewFrame = page.getByTestId('preview-frame');
    this.preview = page.frameLocator('[data-testid="preview-frame"]');
  }

  /** Opens the editor, or a share link built against {@link playgroundURL}. */
  async goto(url: string = playgroundURL): Promise<void> {
    await this.$ref.goto(url);
  }

  /**
   * Picks an example or template from the header's instrument list by its label. The list's search
   * box matches on instrument ids rather than labels, so the option is clicked without filtering.
   */
  async selectInstrument(label: string): Promise<void> {
    await this.$ref.getByRole('combobox', { name: 'Load an instrument...' }).click();
    await this.$ref.getByRole('option', { exact: true, name: label }).click();
  }
}
