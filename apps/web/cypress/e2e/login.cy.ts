import { adminUser } from '@/test/server/stubs';

describe('login', () => {
  it('passes', () => {
    cy.visit('/auth/login');
    const form = cy.get('form[data-cy="login-form"]');
    form.get('input[name="username"]').type(adminUser.username);
    form.get('input[name="password"]').type(adminUser.password);
    form.get('button[aria-label="Submit Button"]').click();
  });
});
