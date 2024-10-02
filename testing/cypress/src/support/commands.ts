/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

/// <reference types="cypress" />

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import type { SessionType } from '@opendatacapture/schemas/session';
import type { Sex } from '@opendatacapture/schemas/subject';

declare global {
  namespace Cypress {
    interface Chainable {
      clickNavLink(url: string): Chainable<void>;
      completeLoginForm(user: { password: string; username: string }): Chainable<void>;
      completeSetupForm(admin: {
        firstName: string;
        lastName: string;
        password: string;
        username: string;
      }): Chainable<void>;
      completeStartSessionForm(
        info:
          | {
              dateOfBirth: Date;
              firstName: string;
              lastName: string;
              method: 'PERSONAL_INFO';
              sex: Sex;
              type: SessionType;
            }
          | { identifier: string; method: 'CUSTOM_ID'; type: SessionType }
      ): Chainable<void>;
      formSelectField(formSelector: string, fieldName: string, option: string): Chainable<void>;
      formSubmit(formSelector: string): Chainable<void>;
      selectInstrument(label: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('clickNavLink', (url) => {
  cy.get(`nav button[data-nav-url="${url}"]`).click();
  cy.url().should('include', url);
});

Cypress.Commands.add('completeLoginForm', ({ password, username }) => {
  cy.get('form[data-cy="login-form"]').as('loginForm');
  cy.get('@loginForm').find('input[name="username"]').type(username);
  cy.get('@loginForm').find('input[name="password"]').type(password);
  cy.formSubmit('@loginForm');
});

Cypress.Commands.add('completeSetupForm', ({ firstName, lastName, password, username }) => {
  cy.get(`form[data-cy="setup-form"]`).as('setupForm');
  cy.get('@setupForm').find('input[name="firstName"]').type(firstName);
  cy.get('@setupForm').find('input[name="lastName"]').type(lastName);
  cy.get('@setupForm').find('input[name="username"]').type(username);
  cy.get('@setupForm').find('input[name="password"]').type(password);
  cy.get('@setupForm').find('#initDemo-true').click();
  cy.get('@setupForm').find('input[name="dummySubjectCount"]').type('10');
  cy.get('@setupForm').find('input[name="recordsPerSubject"]').type('10');
  cy.formSubmit('@setupForm');
});

Cypress.Commands.add('completeStartSessionForm', (data) => {
  cy.get(`form[data-cy="start-session-form"]`).as('startSessionForm');
  cy.formSelectField('@startSessionForm', 'subjectIdentificationMethod', data.method);
  if (data.method === 'CUSTOM_ID') {
    cy.get('input[name="subjectId"]').type(data.identifier);
  } else if (data.method === 'PERSONAL_INFO') {
    cy.get('input[name=subjectFirstName]').type(data.firstName);
    cy.get('input[name=subjectLastName]').type(data.lastName);
    cy.get('input[name="subjectDateOfBirth"]').type(toBasicISOString(data.dateOfBirth));
    cy.formSelectField('@startSessionForm', 'subjectSex', data.sex);
  } else {
    throw new Error(`Unexpected identification method: ${Reflect.get(data, 'method')}`);
  }
  cy.formSelectField('@startSessionForm', 'sessionType', data.type);
  cy.formSubmit('@startSessionForm');
});

Cypress.Commands.add('formSelectField', (formSelector, fieldName, option) => {
  cy.get(formSelector).find(`button[data-testid="${fieldName}-select-trigger"]`).click();
  cy.get(`div[data-testid="${fieldName}-select-content"]`)
    .find(`div[data-testid="${fieldName}-select-item-${option}"]`)
    .click();
});

Cypress.Commands.add('formSubmit', (formSelector) => {
  cy.get(formSelector).find('button[aria-label="Submit"]').click();
});

Cypress.Commands.add('selectInstrument', (label) => {
  cy.get('button[data-cy="select-instrument-dropdown-trigger"]').click();
  cy.get('div[data-cy="select-instrument-dropdown-item"]').contains(label).click();
});
