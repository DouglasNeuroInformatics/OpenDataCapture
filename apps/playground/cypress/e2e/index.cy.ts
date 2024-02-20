describe('/', () => {
  it('should load the editor', () => {
    cy.loadEditor();
    // cy.get('.monaco-editor').as('editor');
    // cy.visit('/');
    // cy.get('@editor').click().focused().type('Hello World');
  });
});
