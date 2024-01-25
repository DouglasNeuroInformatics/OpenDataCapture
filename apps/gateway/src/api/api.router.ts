// import { $CreateAssignmentRelayData } from '@open-data-capture/common/assignment';
import { Router } from 'express';

const router = Router();

router.get('/assignments', (req, res) => {
  // const data = $CreateAssignmentRelayData.parseAsync(re);
  console.log(req.body);
  res.send('Hello World');
});

router.post('/assignments', (req, res) => {
  // const data = $CreateAssignmentRelayData.parseAsync(re);
  console.log(req.body);
  res.send('Hello World');
});

router.get('*', (_, res) => {
  res.status(404).send('Not Found');
});

export { router as apiRouter };
