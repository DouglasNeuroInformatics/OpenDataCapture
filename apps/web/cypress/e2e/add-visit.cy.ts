import { adminUser } from '@/test/server/stubs';

describe('look at questionnaire', () => {
  it('passes', () => {
    //navigate to add visit page, fill in subject form
    cy.login(adminUser.username, adminUser.password);
    cy.addAVisit('tester', 'testpatient');

    cy.get('h3[data-cy="instrument-title"]').contains('Montreal Cognitive Assessment').click();
    cy.get('button')
      .contains(new RegExp('^' + 'Begin' + '$', 'g'))
      .click();

    //form begins and inputs are filled out
    cy.get('input[name="abstraction"]').type('1');
    cy.get('input[name="attention"]').type('1');
    cy.get('input[name="delayedRecall"]').type('1');
    cy.get('input[name="language"]').type('1');

    //click radio button "yes"
    cy.get('div[data-cy="radio-option"]').first().click();

    //fill out rest of form
    cy.get('input[name="naming"]').type('1');
    cy.get('input[name="orientation"]').type('1');
    cy.get('input[name="visuospatialExecutive"]').type('1');

    //submit form
    // cy.get('button[aria-label="Submit Button"]').click();
    cy.get('form[data-cy="form-content"]').children().get('button[aria-label="Submit Button"]').click();
  });
});
