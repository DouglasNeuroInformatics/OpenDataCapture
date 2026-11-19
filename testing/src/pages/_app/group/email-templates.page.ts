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

  /**
   * The delete control on the row for `name`. Scoped to that row because earlier specs leave
   * their own templates in the list, so the first delete button is not this test's, and because
   * the button's own testid carries a UUID the spec never sees.
   */
  deleteButtonFor(name: string): Locator {
    return this.rowFor(name).getByTestId(/^template-delete-/);
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
