import { adminUser } from '@/test/server/stubs';

describe('look at questionaire', () => {
  it('passes', () => {
    //navigate to add visit page, fill in subject form
    cy.login(adminUser.username, adminUser.password);

    cy.get('button[data-cy="add-visit"]').first().click();
    cy.get('input[name=firstName]').type('testing');
    cy.get('input[name=lastName]').type('testPatient');

    //activate a fill in DOB date reader
    cy.get('input[class=field-input]').first().type('test');
    cy.get('svg[data-testid="arrow-up-icon"]').eq(1).click();
    cy.get('button').contains('1999').click();
    cy.get('button', { timeout: 10000 }).contains(14).should('be.visible');
    cy.get('button').contains('14').click();

    cy.get('button[class="field-input capitalize"]').click();
    cy.get('li').contains('Female').click();
    //submit form
    cy.get('button[type="submit"]').click();

    //navigate to view instrument page, select a form and confirm subject info is autofilled
    cy.get('button[data-cy="view-instrument"]').click();

    cy.url().should('include', '/instruments/available-instruments');
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
    cy.get('div[role="radio"]').first().click();

    //fill out rest of form
    cy.get('input[name="naming"]').type('1');
    cy.get('input[name="orientation"]').type('1');
    cy.get('input[name="visuospatialExecutive"]').type('1');

    //submit form
    cy.get('button[aria-label="Submit Button"]').click();
  });
});
