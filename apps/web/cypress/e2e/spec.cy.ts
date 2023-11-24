// //make sure to change these credentials based on the profiles within the database
import { adminUser } from '@/test/server/stubs';
// const username = 'david';
// const password = 'Password123';

describe('Graph test', () => {
  it('passes', () => {

    cy.login(adminUser.username, adminUser.password);

    //navigates the view sujects, selects the first subject and views their graph
    cy.get('button[data-cy="view-subjects"]').first().click({force: true})
    cy.get('td').first().click()
    cy.get('a[data-cy="graph"]').first().click()
    cy.get('div[data-cy="instrument-select"]').contains('Instrument').click()
    cy.get('button[id*="headlessui-menu-item-:"]').first().click()

    cy.get('div[data-cy="measure-select"]').contains('Measures').click()
    cy.get('li[id*="headlessui-listbox-option-:"]').first().click()

  })
})
