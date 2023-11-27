// //make sure to change these credentials based on the profiles within the database
import { adminUser } from '@/test/server/stubs';
// const username = 'david';
// const password = 'Password123';

describe('Subject view test', () => {
  it('passes', () => {

    cy.login(adminUser.username, adminUser.password);

    //navigates the view sujects, selects the first subject and views their graph
    cy.get('button[data-cy="view-subjects"]').first().click({force: true});

    //select first user and their instrument dropdown
    cy.get('td').first().click();
    // cy.get('div[data-cy="instruement-select"]').click();
    cy.get('a').contains('Table').click();
    cy.get('button').contains('Instrument').click();



  })
})
