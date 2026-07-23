import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

/**
 * The instrument runner. Overview, content and summary are three states behind the same URL, so
 * this page object is constructed directly after clicking an instrument card rather than navigated to.
 */
export class RenderInstrumentPage extends AppPage {
  readonly beginButton: Locator;
  /** An inline JSX `block` rendered amongst the groups of the General Consent Form. */
  readonly consentPreamble: Locator;
  readonly submitButton: Locator;
  readonly summaryHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.beginButton = page.getByRole('button', { name: 'Begin' });
    this.consentPreamble = page.getByTestId('consent-preamble');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.summaryHeading = page.getByRole('heading', { name: /Summary of Results/i });
  }

  /** Accepts the General Consent Form by selecting the affirmative radio option. */
  async acceptConsent(): Promise<void> {
    await this.$ref.getByRole('radio', { name: /I have read/ }).click();
  }

  async begin(): Promise<void> {
    await this.beginButton.waitFor({ state: 'visible' });
    await this.beginButton.click();
  }

  /**
   * Answers the Happiness Questionnaire: both 1-10 sliders and "Yes" overall, which leaves the
   * conditional follow-up fields unrendered. Sliders can't be set by `fill`, and dragging is
   * unreliable headless, so nudge them with arrow keys instead.
   */
  async completeHappinessQuestionnaire(steps = 4): Promise<void> {
    const sliders = this.$ref.getByTestId('slider-thumb');
    await sliders.first().waitFor({ state: 'visible' });
    for (let index = 0; index < (await sliders.count()); index++) {
      const slider = sliders.nth(index);
      await slider.focus();
      for (let step = 0; step < steps; step++) {
        await slider.press('ArrowRight');
      }
    }
    await this.$ref.getByRole('radio', { name: 'Yes' }).click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
