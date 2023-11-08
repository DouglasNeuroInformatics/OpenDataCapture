import { jwtDecode } from 'jwt-decode';
import { HttpResponse, http } from 'msw';

import { useAuthStore } from '@/stores/auth-store';

// src/mocks/handlers.js

const authToken =
  'ew0KICAiYWxnIjogIkhTMjU2IiwNCiAgInR5cCI6ICJKV1QiDQp9.ew0KICANCiAgInVzZXJuYW1lIjogImRhdmlkIiwNCiAgInBhc3N3b3JkIjogIlBhc3N3b3JkMTIzIg0KfQ0K';
const authStore = useAuthStore.getState();
console.log(jwtDecode(authToken));
authStore.testSetAccessToken(authToken);

console.log(authStore.accessToken);

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
        success: true,
        token: authStore.accessToken
      });
    } else {
      return new HttpResponse(null, {
        message: 'Login fail',
        status: 401
      });
    }
  })
];
