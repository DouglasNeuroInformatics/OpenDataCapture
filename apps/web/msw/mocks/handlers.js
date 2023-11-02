import { rest, http, HttpResponse } from 'msw';

// src/mocks/handlers.js

export const handlers = [
  http.post('/auth/login', () => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true');

    return new HttpResponse('Login Authenticated')
  }),

];
