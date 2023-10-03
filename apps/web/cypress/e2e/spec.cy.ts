const username = 'david'
const password = 'Password123'


describe('login test', () => {
  it('passes', () => {
    
    cy.login(username, password)
    
    cy.url().should('include','overview')
    cy.get('span').contains('View Instruments').click({force: true})

  })
})

describe('tags test', () => {
  it('passes', () => {
    
    cy.login(username, password)
    
    
    cy.get('span').contains('View Instruments').click({force: true})
    cy.get('button').contains('Tags').click()
    cy.get('span').contains('Well-Being').click({force: true})
    cy.get('[data-cy="instrument-card"]').first().contains('Tags: Well-Being')

   
    cy.get('span').contains('Well-Being').click({force: true})
    cy.get('span').contains('Cognitive').click({force: true})
    cy.get('[data-cy="instrument-card"]').first().contains('Tags: Cognitive')

   
    cy.get('span').contains('Cognitive').click({force: true})
    cy.get('span').contains('Demographics').click({force: true})
    cy.get('[data-cy="instrument-card"]').first().contains('Tags: Demographics')


  })
})
