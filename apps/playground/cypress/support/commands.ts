/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/ban-types */

declare global {
  namespace Cypress {
    interface Chainable {
      loadEditor(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loadEditor', () => {
  cy.visit('/');
  cy.get('h1').contains('Loading Editor and Toolchain').as('loading-heading');
  cy.get('@loading-heading').should('exist');
  cy.get('@loading-heading').should('not.exist');
});
