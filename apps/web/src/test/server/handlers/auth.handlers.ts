import { HttpResponse, http } from 'msw';
import { type RequestHandler } from 'msw';

export const authHandlers: RequestHandler[] = [
  http.post('/v1/auth/login', async ({ request }) => {
    const data = await request.json();
    console.log(data);
    return new HttpResponse(null);
  })
];
