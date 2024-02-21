describe('/', () => {
  it('should load the editor', () => {
    cy.editor('load');
    cy.editor('clear');
  });
});
