describe('login test', () => {
  it('passes', () => {
    cy.visit('http://127.0.0.1:3000/auth/login')
    cy.get('input[name="username"]').type('david')
    cy.get('input[name="password"]').type('Password123')
    cy.get('button').contains('Login').click()
    cy.url().should('include','overview')
    
  })
})