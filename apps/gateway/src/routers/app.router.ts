import { Router } from 'express';

const router = Router();

router.get('/', (_, res) => {
  res.send('Hello World');
});

export { router as appRouter };
