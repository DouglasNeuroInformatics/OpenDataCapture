import {  http, HttpResponse } from 'msw';

// src/mocks/handlers.js

export const handlers = [
  http.post('/auth/login', async ({request}) => {
    // eslint-disable-next-line perfectionist/sort-objects
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password')

    if (username === 'testUsername123' && password === 'testPassword123') {
      return new HttpResponse.json(
        {
          success: true,
          message: "Login successful"
        }
      );
    } else {
      return  new HttpResponse.json(
        {
          success: false,
          message: "Login failed"
        }
      );
    }
  }),

  http.post('/auth/login', () => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true');

    return new HttpResponse('Login Authenticated');
  })
];
