import { adminUser } from '@/testing/server/stubs';

import { createDownloadsFolder, deleteDownloadsFolder } from '../utils';

before(() => {
  createDownloadsFolder();
});

after(() => {
  deleteDownloadsFolder();
});

// The reason why buttons are force clicked here, is because of a CSS issue (only in cypress) where
// the icon in the dropdown toggle is oversized. Once fixed, this should be removed.

describe('Subject view test', () => {
  it('passes', () => {
    cy.login(adminUser.username, adminUser.password);

    // navigates the view subjects, selects the first subject and views their graph
    cy.get('button[data-cy="view-subjects"]').first().click();

    // select first user and their instrument dropdown
    cy.get('td[data-cy="table-data-item"]').first().click({ force: true });

    cy.get('a[data-cy="subject-table"]').click({ force: true });
    cy.get('div[data-cy="select-instrument-dropdown-container"] button').click({ force: true });
    cy.get('button[data-cy="dropdown-menu-option"]').eq(0).click();

    cy.get('div[data-cy="time-dropdown-container"] button').click();
    cy.get('button[data-cy="dropdown-menu-option"]').eq(2).click();

    cy.get('div[data-cy="download-dropdown-container"] button').click();

    cy.get('a[data-cy="subject-graph"]').click();

    cy.get('div[data-cy="instrument-select-dropdown-container"] button').click();
    cy.get('button[data-cy="dropdown-menu-option"]').contains('Unilingual Form').click();

    cy.get('div[data-cy="measure-select-dropdown-container"] button').click();
    cy.get('li[data-cy="select-dropdown-option"]').eq(0).click();

    cy.get('div[class="recharts-wrapper"]').click();

    // choose month as timeline
    cy.get('div[data-cy="time-select-dropdown-container"] button').click();
    cy.get('button[data-cy="dropdown-menu-option"]').eq(0).click();

    cy.get('div[data-cy="download-button-container"] button').click();

    // check if downloaded file exists
    cy.readFile('cypress/downloads/19c6811.png');
  });
});
