import { adminUser } from '@/testing/server/stubs';

describe('completing an in-person session', () => {
  it('should allow the user to administer a unilingual instrument', () => {
    cy.login(adminUser.username, adminUser.password);
    cy.startSession('Jane', 'Doe');
    cy.get('button[data-cy="view-instrument"]').click();
    cy.url().should('include', '/instruments/accessible-instruments');
    cy.get('h3[data-cy="instrument-title"]').contains('Unilingual Form').click();
    cy.get('button')
      .contains(new RegExp('^' + 'Begin' + '$', 'g'))
      .click();

    // form begins and inputs are filled out
    cy.get('input[name="favoriteNumber"]').type('1');

    // submit form
    cy.get('button[aria-label="Submit Button"]').click();
  });
});
