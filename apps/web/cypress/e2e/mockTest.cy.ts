describe('login test', () => {
  it('passes', () => {
    cy.visit('http://127.0.0.1:3000/auth/login');
    cy.get('input[name="username"]').type('testUsername123');
    cy.get('input[name="password"]').type('testPassword123');
    cy.get('button').contains('Login').click();
  });
});
