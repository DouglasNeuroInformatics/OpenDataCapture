import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

/**
 * The instrument runner. Overview, content and summary are three states behind the same URL, so
 * this page object is constructed directly after clicking an instrument card rather than navigated to.
 */
export class RenderInstrumentPage extends AppPage {
  readonly beginButton: Locator;
  readonly consentPreamble: Locator;
  readonly errorMessages: Locator;
  readonly submitButton: Locator;
  readonly summaryHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.beginButton = page.getByRole('button', { name: 'Begin' });
    this.consentPreamble = page.getByTestId('consent-preamble');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.summaryHeading = page.getByRole('heading', { name: /Summary of Results/i });
    this.errorMessages = page.getByTestId('error-message-text');
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
   * Answers a representative subset of the Enhanced Demographics Questionnaire: every field is
   * optional, so this exercises select, radio and number inputs without needing every field filled.
   */
  async completeEnhancedDemographicsQuestionnaire(): Promise<void> {
    await this.$ref.locator('[name="ethnicOrigin"]').selectOption('canadian');
    await this.$ref.locator('[name="gender"]').selectOption('female');
    await this.$ref.locator('[name="religion"]').selectOption('none');
    await this.$ref.locator('[name="firstLanguage"]').selectOption('english');
    // `.check()` is a real, coordinate-based click, which the app-wide toast notification (fixed to
    // the bottom of the viewport, per `NotificationHub`) can sit on top of for this instrument's
    // still-visible "session started" success toast. A direct native click skips hit-testing.
    await this.checkRadio(this.$ref.locator('[name="speaksEnglish"][value="true"]'));
    await this.checkRadio(this.$ref.locator('[name="speaksFrench"][value="false"]'));
    await this.$ref.locator('[name="householdSize"]').fill('3');
    await this.$ref.locator('[name="maritalStatus"]').selectOption('married');
    await this.$ref.locator('[name="numberChildren"]').fill('1');
    await this.$ref.locator('[name="postalCode"]').fill('A1A 1A1');
    await this.$ref.locator('[name="annualIncome"]').fill('50000');
    await this.$ref.locator('[name="employmentStatus"]').selectOption('fullTime');
    await this.$ref.locator('[name="yearsOfEducation"]').fill('16');
    await this.$ref.locator('[name="ageAtImmigration"]').fill('10');
    await this.checkRadio(this.$ref.locator('[name="isCanadianCitizen"][value="true"]'));
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

  private async checkRadio(radio: Locator): Promise<void> {
    await radio.waitFor({ state: 'visible' });
    await radio.evaluate((element: HTMLInputElement) => {
      element.click();
    });
  }
}
