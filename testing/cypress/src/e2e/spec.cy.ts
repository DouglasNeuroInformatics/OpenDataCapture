import { capitalize, toBasicISOString, toLowerCase } from '@douglasneuroinformatics/libjs';
import type { SetupState } from '@opendatacapture/schemas/setup';

import { admin, createSubjectIdentificationData } from '../stubs';
import { createDownloadsFolder, deleteDownloadsFolder } from '../utils';

describe('e2e', () => {
  let setupState: SetupState;

  before(() => {
    createDownloadsFolder();
    cy.request('/api/v1/setup')
      .its('body')
      .then((state) => {
        setupState = state as SetupState;
      });
  });

  after(() => {
    deleteDownloadsFolder();
  });

  it('should be a valid setup state', () => {
    expect(setupState).to.include.all.keys('isDemo', 'isGatewayEnabled', 'isSetup');
  });

  it('should allow submitting the setup form, or redirect to the login page if it is already setup', () => {
    cy.visit('/setup');
    if (!setupState.isSetup) {
      cy.url().should('include', '/setup');
      cy.completeSetupForm(admin);
    }
    cy.url().should('include', '/auth/login');
  });

  it('should allow the admin to login', () => {
    cy.visit('/auth/login');
    cy.url().should('include', '/auth/login');
    cy.completeLoginForm(admin);
  });

  it('should allow starting a session with a custom id', () => {
    cy.visit('/auth/login');
    cy.completeLoginForm(admin);
    cy.clickNavLink('start-session');
    cy.url().should('include', '/session/start-session');
    cy.completeStartSessionForm({ identifier: '123', method: 'CUSTOM_ID', type: 'IN_PERSON' });
    cy.get('div[data-cy="current-session-info"]').contains('ID: ').should('have.text', 'ID: 123');
  });

  it('should allow starting a session using personal information', () => {
    const subject = createSubjectIdentificationData();
    cy.visit('/auth/login');
    cy.completeLoginForm(admin);
    cy.clickNavLink('start-session');
    cy.url().should('include', '/session/start-session');
    cy.completeStartSessionForm({
      ...subject,
      method: 'PERSONAL_INFO',
      type: 'IN_PERSON'
    });
    cy.get('div[data-cy="current-session-info"]').as('sessionInfo');
    cy.get('@sessionInfo').contains('Full Name:').should('contain.text', `${subject.firstName} ${subject.lastName}`);
    cy.get('@sessionInfo').contains('Date of Birth:').should('contain.text', toBasicISOString(subject.dateOfBirth));
    cy.get('@sessionInfo')
      .contains('Sex at Birth:')
      .should('contain.text', capitalize(toLowerCase(subject.sex)));
  });

  it('should allow viewing a subject', () => {
    cy.visit('/auth/login');
    cy.completeLoginForm(admin);
    cy.clickNavLink('datahub');
    cy.url().should('include', '/datahub');

    // select first user
    cy.get('div[data-cy="master-data-table"] table').find('td').first().click();

    // navigate to table page
    cy.get('a[data-cy="subject-table"]').click();

    cy.get('div[data-cy="subject-table"] tbody tr > td').first().as('firstDateCollected');
    cy.get('@firstDateCollected').should(($td) => {
      const text = $td.text();
      expect(text).not.to.match(/\d\d\d\d-\d\d-\d\d/);
    });

    cy.selectInstrument('Happiness Questionnaire');

    cy.get('button[data-cy="time-dropdown-trigger"]').click();
    cy.get('div[data-cy="time-dropdown-item"]').contains('All-Time').click();

    cy.get('@firstDateCollected').should(($td) => {
      const text = $td.text();
      expect(text).to.match(/\d\d\d\d-\d\d-\d\d/);
    });

    cy.get('button').contains('Download').click();
    cy.get('div[role="menuitem"]').contains('JSON').click();

    cy.task<string[]>('readdir', Cypress.config('downloadsFolder'))
      .then((files) => {
        const regexp = new RegExp('^.*/ropdav_HAPPINESS_QUESTIONNAIRE.*?.json$');
        const filename = files.find((filename) => regexp.test(filename));
        expect(filename).to.be.a('string');
        return cy.readFile(filename!);
      })
      .then((content: { [key: string]: any }[]) => {
        expect(Array.isArray(content)).to.eq(true);
        expect(content.length).to.be.greaterThan(0);
        expect(content.every((record) => typeof record.isSatisfiedOverall === 'boolean')).to.eq(true);
      });

    cy.get('a[data-cy="subject-graph"]').click();
    cy.selectInstrument('Happiness Questionnaire');

    cy.get('button').contains('Measures').click();
    cy.get('div[data-testid="select-dropdown-option"').contains('Overall Satisfaction Score').click();
    cy.get('button').contains('Download').click({ force: true });
    cy.get('div[role="menuitem"]').contains('PNG').click();
    cy.get('h2')
      .contains('Instrument Records for Subject')
      .then(($h2) => {
        const subjectId = $h2.text().split(' ').at(-1)!.trim();
        cy.readFile(`${Cypress.config('downloadsFolder')}/${subjectId}.png`);
      });
  });

  it('should allow the user to administer a unilingual instrument', () => {
    cy.visit('/auth/login');
    cy.completeLoginForm(admin);
    cy.clickNavLink('start-session');
    cy.url().should('include', '/session/start-session');
    cy.completeStartSessionForm({ identifier: '123', method: 'CUSTOM_ID', type: 'IN_PERSON' });
    cy.clickNavLink('accessible-instruments');
    cy.url().should('include', '/instruments/accessible-instruments');
    cy.get('button').contains('Tags').click();
    cy.get('div[data-testid="select-dropdown-option"]').contains('Well-Being').click();
    cy.get('h5[data-cy="instrument-card-tags"]').each(($h5) => {
      expect($h5.text()).to.include('Well-Being');
    });
    cy.get('h3[data-cy="instrument-card-title"]').contains('Happiness Questionnaire').click({ force: true });
    cy.get('button').contains('Begin').click();
    cy.get('form[data-cy="form-content"]').as('formContent');
    cy.get('@formContent')
      .find('span[data-testid="slider-track"')
      .each(($span) => {
        cy.wrap($span).click();
      });
    cy.get('#isSatisfiedOverall-true').click();
    cy.formSubmit('@formContent');
    cy.get('h4').contains('Summary of Results for the Happiness Questionnaire');
  });
});
