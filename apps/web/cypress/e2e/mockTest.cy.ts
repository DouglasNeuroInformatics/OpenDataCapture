describe('login test', () => {
  before(() => {
    cy.visit('http://127.0.0.1:3000/auth/login');
  });
  it('passes', () => {
    // cy.visit('http://127.0.0.1:3000/auth/login');
    cy.window().then((window) => {
      // Reference global instances set in "src/mocks.js".
      const { worker, rest } = window.msw;

      worker.use(
        rest.post('/auth/login', async ({request}) => {
          const info = await request.formData();

          return info.username;
        })
      );
      cy.get('input[name="username"]').type('testUsername123');
      cy.get('input[name="password"]').type('testPassword123');
      cy.get('button').contains('Login').click();
    });
  });
});
