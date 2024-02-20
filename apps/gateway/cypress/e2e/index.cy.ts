describe('/', () => {
  it('should return 404', () => {
    cy.request({ failOnStatusCode: false, url: '/' }).its('status').should('equal', 404);
  });
});
