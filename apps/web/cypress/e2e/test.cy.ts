describe('look at questionaire', () => {
    it('passes', () => {
      
      cy.login('david','Password123')
      cy.get('span').contains('Add Visit').click({force: true})
      cy.get('input[name=firstName]').type('test')
      cy.get('input[name=lastName]').type('patient')
      cy.get('input[class=field-input]').type('2023-09-21')
      cy.get('button[class="field-input capitalize"]').click({force:true})
      cy.get('body').click()
      cy.get('li').contains('Male').click()
      cy.get('button').contains('Submit').click()

      cy.wait(2000)

      cy.get('span').contains('View Instruments').click({force: true})
      cy.url().should('include', 'instruments/available')
      cy.wait(2000)
      cy.get('div').contains('Questionnaire').first().click()

      cy.get('button').contains('Begin').click()
      // cy.get('input[name=firstName]').should('include','test')
      // cy.get('input[name=lastName]').should('include','patient')
    })
  })