import { $CreateAssignmentRelayData } from '@open-data-capture/common/assignment';
import { Router } from 'express';

import { ah } from '@/utils/async-handler';
import { HttpException } from '@/utils/http-exception';

const router = Router();

router.get('/assignments', (req, res) => {
  // const data = $CreateAssignmentRelayData.parseAsync(re);
  console.log(req.body);
  res.send('Hello World');
});

router.post(
  '/assignments',
  ah(async (req, res, next) => {
    const result = await $CreateAssignmentRelayData.safeParseAsync(req.body);
    if (!result.success) {
      return next(new HttpException(400, 'Bad Request'));
    }
    res.status(200).send(result.data);
  })
);

router.get('*', (_, res) => {
  res.status(404).send('Not Found');
});

export { router as apiRouter };
