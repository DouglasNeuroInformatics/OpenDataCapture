import { setupWorker, rest } from 'msw';

describe('login test', () => {
  it('passes', () => {
    cy.visit('http://127.0.0.1:3000/auth/login');
  });
});
