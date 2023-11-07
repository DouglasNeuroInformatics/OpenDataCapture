import { HttpResponse, http } from 'msw';

// src/mocks/handlers.js

export const handlers = [
  http.post(import.meta.env.VITE_API_BASE_URL + '/v1/auth/login', async ({ request }) => {
    // eslint-disable-next-line perfectionist/sort-objects
    const data = await request.json();
    const username = data['username'];
    const password = data['password'];

    if (username === 'david' && password === 'Password123') {
      return new HttpResponse(null, {
        message: 'Login successful',
        status: 200,
        success: true
      });
    } else {
      return new HttpResponse(null, {
        message: 'Login fail',
        status: 401
      });
    }
  })
];
