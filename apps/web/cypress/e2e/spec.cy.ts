describe('login test', () => {
  it('passes', () => {
    
    cy.login('david','Password123')
    
    cy.url().should('include','overview')
    cy.get('span').contains('View Instruments').click({force: true})

  })
})
