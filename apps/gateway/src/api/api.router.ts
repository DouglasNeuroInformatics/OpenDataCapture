import crypto from 'crypto';

import { $CreateAssignmentRelayData } from '@open-data-capture/common/assignment';
import { Router } from 'express';

import { CONFIG } from '@/config';
import { db } from '@/lib/db';
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
  ah(async (req, res) => {
    const result = await $CreateAssignmentRelayData.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    await db.update(({ assignments }) => {
      const createdAt = new Date();
      const id = crypto.randomUUID();
      assignments.push({
        createdAt,
        id,
        status: 'OUTSTANDING',
        updatedAt: createdAt,
        url: `${CONFIG.baseUrl}/assignments/${id}`,
        ...result.data
      });
    });
    res.status(200).send(result.data);
  })
);

export { router as apiRouter };
