import type { Solution } from '@cap.js/server';
import { Router } from 'express';
import { z } from 'zod/v4';

import { cap } from '@/lib/cap';
import { ah } from '@/utils/async-handler';
import { HttpException } from '@/utils/http-exception';

const $Solution = z.object({
  solutions: z.array(z.number()),
  token: z.string()
}) satisfies z.ZodType<Solution>;

const router = Router();

router.post('/challenge', (_, res) => {
  res.status(200).json(
    cap.createChallenge({
      challengeDifficulty: 5,
      expiresMs: 60_000 * 5
    })
  );
});

router.post(
  '/redeem',
  ah(async (req, res) => {
    const result = await $Solution.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    const { solutions, token } = result.data;
    res.status(200).json(await cap.redeemChallenge({ solutions, token }));
  })
);

export { router as capRouter };
