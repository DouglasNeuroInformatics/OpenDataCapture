/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --

//This is a login script for the
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/auth/login');
  cy.intercept('GET', '/src/assets/logo.png').as('finalElement');

  //logo.png the last element acquired through GET request before loading full screen thus wait for it to be completed
  //before entering login info
  cy.wait('@finalElement');
  const form = cy.get('form[data-cy="login-form"]');
  form.get('input[name="username"]').type(username);
  form.get('input[name="password"]').type(password);
  form.get('button[data-cy="submit-form"]').click();
});

Cypress.Commands.add('addAVisit', (firstName, lastName) => {
  cy.get('button[data-cy="add-visit"]').first().click();
  cy.url().should('include', '/visits/add-visit');
  cy.get('input[name=firstName]').type(firstName);
  cy.get('input[name=lastName]').type(lastName);

  //activate a fill in DOB date reader
  cy.get('input[data-cy="date-input"]').first().type('test');
  cy.get('button[data-cy="year-select"]').click();
  cy.get('button[data-cy="year-option"]').contains('1999').click();
  cy.get('button[data-cy="day-option"]', { timeout: 10000 }).contains(14).should('be.visible');
  cy.get('button[data-cy="day-option"]').contains('14').click();

  cy.get('button[class="field-input capitalize"]').click();
  cy.get('li').contains('Female').click();
  //submit form
  cy.get('button[data-cy="submit-form"]').click();

  //navigate to view instrument page, select a form and confirm subject info is autofilled
  cy.get('button[data-cy="view-instrument"]').click();

  cy.url().should('include', '/instruments/available-instruments');
});

Cypress.Commands.add('dragTo', { prevSubject: 'element' }, (subject, targetSelector) => {
  cy.wrap(subject).trigger('dragstart');
  cy.get(targetSelector).trigger('drop');
  cy.get(targetSelector).trigger('dragend');
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Chainable {
      addAVisit(firstName: string, lastName: string): Chainable<void>;
      dragTo(prevSubject: string): Chainable<void>;
      login(username: string, password: string): Chainable<void>;
    }
  }
}
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(username: string, password: string): Chainable<void>
//     //   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//     //   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//     //   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
