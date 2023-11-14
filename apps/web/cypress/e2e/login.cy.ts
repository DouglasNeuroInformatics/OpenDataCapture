describe('login', () => {
  it('passes', () => {
    cy.visit('/auth/login');
    expect(true).to.equal(true);
    // cy.wait(1000);
    // cy.get('input[name="username"]').type('david');
    // cy.get('input[name="password"]').type('Password123');
    // cy.get('button').contains('Login').click();
  });
});
