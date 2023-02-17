describe('Login Page', () => {
  it('the heading contains the correct test', () => {
    cy.visit('http://localhost:3000');
    cy.get('h1').should('exist').contains('Login');
  });
});
