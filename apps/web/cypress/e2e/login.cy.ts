describe('login', () => {
  it('passes', () => {
    cy.visit('/auth/login');
    const form = cy.get('form[data-cy="login-form"]');
    form.get('input[name="username"]').type('David');
    form.get('input[name="password"]').type('Password123');
    form.get('button[aria-label="Submit Button"]').click();
  });
});
