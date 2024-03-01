import { adminUser } from '@/test/server/stubs';

// //randomizer function to create random test patient name
function makeid(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const name = makeid(6);

describe('look at questionaire', () => {
  it('passes', () => {
    //navigate to add visit page, fill in subject form
    cy.login(adminUser.username, adminUser.password);
    cy.wait(2000);
    cy.get('button[data-cy="add-visit"]').first().click({ force: true });
    cy.get('input[name=firstName]').type(name);
    cy.get('input[name=lastName]').type('testPatient');

    //activate a fill in DOB date reader
    cy.get('input[class=field-input]').first().type('test');
    cy.get('svg[data-testid="arrow-up-icon"]').eq(1).click();
    cy.get('button').contains('1999').click();
    cy.wait(500);
    cy.get('button').contains('11').click();

    cy.get('button[class="field-input capitalize"]').click({ force: true });
    cy.get('li[id*="headlessui-listbox-option-:"]').first().click();
    //submit form
    cy.get('button[type="submit"]').click({ force: true });

    cy.wait(1000);

    //navigate to view instrument page, select a form and confirm subject info is autofilled
    cy.get('button[data-cy="view-instrument"]').click({ force: true });
    cy.url().should('include', '/instruments/available-instruments');
    cy.wait(1000);
    cy.get('h3[data-cy="instrument-title"]').contains('Happiness Questionnaire').click();
    cy.get('button')
      .contains(new RegExp('^' + 'Begin' + '$', 'g'))
      .click({ force: true });
  });
});
