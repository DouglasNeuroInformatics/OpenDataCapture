/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/ban-types */

import { match } from 'ts-pattern';

declare global {
  namespace Cypress {
    interface Chainable {
      editor: (action: 'clear' | 'load') => void;
    }
  }
}

Cypress.Commands.add('editor', (action) => {
  match(action)
    .with('clear', () => {
      cy.get('.monaco-editor').as('editor');
      cy.get('@editor').click();
      cy.focused().type(`${Cypress.platform === 'darwin' ? '{cmd}a' : '{ctrl}a'}{backspace}`);
    })
    .with('load', () => {
      cy.visit('/');
      cy.get('h1').contains('Loading Editor and Toolchain').as('loading-heading');
      cy.get('@loading-heading').should('exist');
      cy.get('@loading-heading').should('not.exist');
    })
    .exhaustive();
});
