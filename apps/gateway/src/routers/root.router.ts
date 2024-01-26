import { Router } from 'express';

const router = Router();

router.get('*', (_, res) => {
  const html = res.locals.loadRoot({ message: 'Hello from the app router' });
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
});

export { router as rootRouter };
