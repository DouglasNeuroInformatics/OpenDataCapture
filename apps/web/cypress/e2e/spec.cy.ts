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
    cy.get('button').contains('Tags').click()
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
    cy.get('button').contains('Instrument').click()
    cy.get('button').contains('Happiness Questionnaire').click()

    cy.get('button').contains('Measures').click()
    cy.get('span').contains('Overall Happiness').click()


  })
})