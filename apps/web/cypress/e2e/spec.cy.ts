const username = 'david'
const password = 'Password123'


describe('login test', () => {
  it('passes', () => {
    
    cy.login(username, password)
    
    cy.url().should('include','overview')
    cy.get('span[data-cy="view-subjects"]').first().click({force: true})

  })
})

describe('tags test', () => {
  it('passes', () => {
    
    cy.login(username, password)
    
    
    cy.get('span[data-cy="view-instrument"]').first().click({force: true})
    cy.get('div[data-cy="tags"]').click()
    cy.get('span').contains('Well-Being').click({force: true})
    cy.get('h5[data-cy="instrument-card"]').first().should('have.text','Tags: Well-Being')

   
    cy.get('span').contains('Well-Being').click({force: true})
    cy.get('span').contains('Cognitive').click({force: true})
    cy.get('h5[data-cy="instrument-card"]').first().should('have.text','Tags: Cognitive')

   
    cy.get('span').contains('Cognitive').click({force: true})
    cy.get('span').contains('Demographics').click({force: true})
    cy.get('h5[data-cy="instrument-card"]').first().should('have.text','Tags: Demographics')


  })
})


describe('Graph test', () => {
  it('passes', () => {
    
    cy.login(username, password)
    
    
    cy.get('span[data-cy="view-subjects"]').first().click({force: true})
    cy.get('td').first().click()
    cy.get('a[data-cy="graph"]').first().click()
    cy.get('div[data-cy="instrument-select"]').contains('Instrument').click()
    cy.get('button[id*="headlessui-menu-item-:"]').first().click()

    cy.get('div[data-cy="measure-select"]').contains('Measures').click()
    cy.get('li[id*="headlessui-listbox-option-:"]').first().click()


  })
})