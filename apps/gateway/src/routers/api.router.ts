import { Router } from 'express';

const router = Router();

router.get('/', (_, res) => {
  res.send('Hello World');
});

router.get('*', (_, res) => {
  res.status(404).send('Not Found');
});

export { router as apiRouter };
