declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Chainable {
      addVisit(firstName: string, lastName: string): Chainable<void>;
      dragTo(prevSubject: string): Chainable<void>;
      login(username: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (username, password) => {
  cy.visit('/auth/login');
  const form = cy.get('form[data-cy="login-form"]');
  form.get('input[name="username"]').type(username);
  form.get('input[name="password"]').type(password);
  form.get('button[data-cy="submit-form"]').click();
});

Cypress.Commands.add('addVisit', (firstName, lastName) => {
  cy.get('button[data-cy="add-visit"]').first().click();
  cy.url().should('include', '/visits/add-visit');
  cy.get('input[name=firstName]').type(firstName);
  cy.get('input[name=lastName]').type(lastName);
  cy.get('input[name="dateOfBirth"]').first().type('1999-04-01');
  cy.get('button[data-cy="sex-select-trigger"]').first().click();
  cy.get('div[data-cy="sex-select-content"]').get('span').contains('Female').click();
  cy.get('button[data-cy="submit-form"]').click();
});

Cypress.Commands.add('dragTo', { prevSubject: 'element' }, (subject, targetSelector) => {
  cy.wrap(subject).trigger('dragstart');
  cy.get(targetSelector).trigger('drop');
  cy.get(targetSelector).trigger('dragend');
});
