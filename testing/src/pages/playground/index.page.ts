import type { FrameLocator, Locator, Page } from '@playwright/test';

import { playgroundURL } from '../../support/env';

/**
 * The playground editor. It is not an `apps/web` route, so this does not extend `RootPage` and is
 * not registered in `pageModels`; it navigates by absolute URL and needs no token.
 */
export class PlaygroundPage {
  readonly $ref: Page;
  readonly editorPane: Locator;
  /** The handle between the editor and preview panes, which resizes them. */
  readonly paneSeparator: Locator;
  /** The instrument preview, which runs on another origin than the editor. */
  readonly preview: FrameLocator;
  readonly previewFrame: Locator;
  readonly previewPane: Locator;

  constructor(page: Page) {
    this.$ref = page;
    this.editorPane = page.getByTestId('editor-pane');
    this.paneSeparator = page.getByRole('separator');
    this.previewFrame = page.getByTestId('preview-frame');
    this.preview = page.frameLocator('[data-testid="preview-frame"]');
    this.previewPane = page.getByTestId('preview-pane');
  }

  /** Drags the pane separator to `x`, in page coordinates. */
  async dragPaneSeparatorTo(x: number): Promise<void> {
    const separator = (await this.paneSeparator.boundingBox())!;
    const y = separator.y + separator.height / 2;
    await this.$ref.mouse.move(separator.x + separator.width / 2, y);
    await this.$ref.mouse.down();
    await this.$ref.mouse.move(x, y, { steps: 10 });
    await this.$ref.mouse.up();
  }

  /** The editor's share of the width the editor and preview panes divide between them, from 0 to 1. */
  async editorShare(): Promise<number> {
    const [editor, preview] = await Promise.all([this.editorPane.boundingBox(), this.previewPane.boundingBox()]);
    return editor!.width / (editor!.width + preview!.width);
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
