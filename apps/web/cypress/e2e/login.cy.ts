import { adminUser } from '@/test/server/stubs';

describe('login', () => {
  it('passes', () => {
    cy.login(adminUser.username, adminUser.password);
  });
});
