describe('login test', () => {
  it('passes', () => {
    cy.visit('http://127.0.0.1:3000/auth/login');
    cy.window().then((window) => {
      // Reference global instances set in "src/mocks.js".
      const { rest, worker } = window.msw;

      worker.use(
        rest.post('http://127.0.0.1:3000/overview', (req, res, ctx) => {
          return res(ctx.json({ success: true }));
        })
      );
    });
  });
});
