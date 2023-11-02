import { rest, http, HttpResponse } from 'msw';

// src/mocks/handlers.js

export const handlers = [
  rest.post('/auth/login', (req, res, ctx) => {
    // eslint-disable-next-line perfectionist/sort-objects
    const { username, password } = req.json();

    if (username === 'testUsername123' && password === 'testPassword123') {
      return res(ctx.status(200), ctx.json({ message: 'Login successful', token: 'yourtoken' }));
    } else {
      return res(ctx.status(401), ctx.json({ message: 'Login failure' }));
    }
  }),

  http.post('/auth/login', () => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true');

    return new HttpResponse('Login Authenticated');
  })
];
