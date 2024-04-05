// //make sure to change these credentials based on the profiles within the database
import { adminUser } from '@/test/server/stubs';
// const username = 'david';
// const password = 'Password123';

describe('Subject view test', () => {
  it('passes', () => {
    cy.login(adminUser.username, adminUser.password);

    //navigates the view sujects, selects the first subject and views their graph
    cy.get('button[data-cy="view-subjects"]').first().click({ force: true });

    //select first user and their instrument dropdown
    cy.get('td[data-cy="table-data-item"]').first().click();

    cy.get('a[data-cy="subject-table"]').click();
    cy.get('div[data-cy="select-instrument"]').click();
    cy.get('button[data-cy="dropdown-menu-option"]').eq(0).click();

    cy.get('div[data-cy="time-dropdown"]').click();
    cy.get('button[data-cy="dropdown-menu-option"]').eq(2).click();

    cy.get('div[data-cy="download-dropdown"]').click();

    cy.get('a[data-cy="subject-graph"]').click();

    //choosing first questionnaire as instrument
    cy.get('div[data-cy="instrument-select"]').click();
    cy.get('button[data-cy="dropdown-menu-option"]').eq(0).click();

    //choose overall happiness
    cy.get('div[data-cy="measure-select"]').click();
    cy.get('li[data-cy="select-dropdown-option"]').click();

    cy.get('div[class="recharts-wrapper"]').click();

    //choose month as timeline
    cy.get('div[data-cy="time-select"]').click();
    cy.get('button[data-cy="dropdown-menu-option"]').eq(0).click();

    cy.get('div[data-cy="download-button"]').click();

    //check if downloaded file exists
    cy.readFile('cypress/downloads/19c6811.png');
  });
});
