import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class GroupEmailTemplatesPage extends AppPage {
  readonly builtInDefaultBadge: Locator;
  readonly createAnyway: Locator;
  readonly createBody: Locator;
  readonly createSubject: Locator;
  readonly createSubmit: Locator;
  readonly deleteConfirm: Locator;
  readonly insertUrl: Locator;
  readonly name: Locator;
  readonly root: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('group-email-templates');
    this.name = page.getByTestId('template-name');
    this.createSubject = page.getByTestId('template-create-subject');
    this.createBody = page.getByTestId('template-create-body');
    this.insertUrl = page.getByTestId('template-create-insert-url');
    this.createSubmit = page.getByTestId('template-create-submit');
    this.createAnyway = page.getByTestId('template-create-anyway');
    this.deleteConfirm = page.getByTestId('template-delete-confirm');
    this.builtInDefaultBadge = page.getByTestId('template-active-builtin');
  }

  /** The create form's inline validation message, shown when the body is missing a placeholder. */
  get createError(): Locator {
    return this.$ref.getByTestId('template-create-error');
  }

  /** Create a template authored in one language, accepting the missing-translations warning. */
  async createTemplate(fields: { body: string; name: string; subject: string }) {
    await this.fillCreateForm(fields);
    await this.createAnyway.waitFor({ state: 'visible' });
    await this.createAnyway.click();
  }

  /**
   * The delete control on the row for `name`. Scoped to that row because earlier specs leave
   * their own templates in the list, so the first delete button is not this test's, and because
   * the button's own testid carries a UUID the spec never sees.
   */
  deleteButtonFor(name: string): Locator {
    return this.rowFor(name).getByTestId(/^template-delete-/);
  }

  /**
   * Fill and submit the create form in the currently selected language. Authoring a single
   * language raises the missing-translations warning, so callers confirm it via
   * {@link createAnyway}.
   */
  async fillCreateForm({ body, name, subject }: { body: string; name: string; subject: string }) {
    await this.name.fill(name);
    await this.createSubject.fill(subject);
    await this.createBody.fill(body);
    await this.createSubmit.click();
  }

  /** The list row whose label is `name`. */
  rowFor(name: string): Locator {
    return this.root.getByTestId('template-row').filter({ hasText: name });
  }

  /** The "set default" control on the row for `name`. */
  setActiveButtonFor(name: string): Locator {
    return this.rowFor(name).getByTestId(/^template-set-active-/);
  }
}
