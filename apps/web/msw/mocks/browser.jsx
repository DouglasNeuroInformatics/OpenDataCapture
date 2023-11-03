import { rest, setupWorker, http } from 'msw';

const worker = setupWorker(
  rest.get('/auth/login', (res, req, ctx) => {
    return res();
  }),
  http.get('/auth/login', async ({request}) => {
    const data = await request.formData();
    const username = data.get('username')
    const password = data.get('password')
  })
);

worker.start();
