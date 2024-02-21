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
    cy.get('td').first().click();
    // cy.get('div[data-cy="instruement-select"]').click();
    cy.get('a[data-cy="subject-table"]').click();
    cy.get('div[data-cy="select-instrument"]').click();
    cy.get('button[id*="headlessui-menu-item-:r1"]').eq(0).click();

    cy.get('div[data-cy="time-dropdown"]').click();
    cy.get('button[id*="headlessui-menu-item-:r1"]').eq(2).click();

    cy.get('div[data-cy="download-dropdown"]').click();

    cy.get('a[data-cy="subject-graph"]').click();

    cy.get('div[data-cy="instrument-select"]').click();
    cy.get('button[id*="headlessui-menu-item-:r2"]').eq(1).click();

    cy.get('div[data-cy="measure-select"]').click();
    cy.get('li[id*="headlessui-listbox-option-:r2"]').click();

    cy.get('div[class="recharts-wrapper"]').click();

    cy.get('div[data-cy="time-select"]').click();
    cy.get('button[id*="headlessui-menu-item-:r2"]').eq(1).click();
  });
});
