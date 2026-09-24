import type { Solution } from '@cap.js/server';
import { Router } from 'express';
import { z } from 'zod/v4';

import { markAssignmentVerified } from '@/lib/assignment-verification';
import { cap } from '@/lib/cap';
import { ah } from '@/utils/async-handler';
import { HttpException } from '@/utils/http-exception';

const $Solution = z.object({
  solutions: z.array(z.number()),
  token: z.string()
}) satisfies z.ZodType<Solution>;

/**
 * Assignment ids are UUIDs. The bound is what matters: the verification set never forgets an id that
 * matches no assignment, so this unauthenticated route must not store an arbitrarily large one.
 */
const MAX_ASSIGNMENT_ID_LENGTH = 64;

const $VerifyRequest = z.object({
  id: z.string().max(MAX_ASSIGNMENT_ID_LENGTH),
  token: z.string()
});

const router = Router();

router.post('/challenge', (_, res) => {
  res.status(200).json(
    cap.createChallenge({
      challengeDifficulty: 4,
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

// Consumes a redeemed Cap token once and records the assignment as human-verified, so the
// (time-limited) token need only survive long enough to be solved, not the whole form.
router.post(
  '/verify',
  ah(async (req, res) => {
    const result = await $VerifyRequest.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    const { id, token } = result.data;
    if (!(await cap.validateToken(token)).success) {
      throw new HttpException(403, 'Invalid proof-of-work token');
    }
    markAssignmentVerified(id);
    res.status(200).json({ success: true });
  })
);

export { $VerifyRequest, router as capRouter };
