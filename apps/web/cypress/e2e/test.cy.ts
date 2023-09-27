
  describe('look at questionaire', () => {
    it('passes', () => {
      
      cy.login('david','Password123')
      cy.get('span').contains('View Instruments').click({force: true})
      cy.url().should('include', 'instruments/available')
      cy.wait(2000)
      cy.get('div').contains('Questionnaire').first().click()
    })
  })