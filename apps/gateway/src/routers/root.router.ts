import { $Language } from '@opendatacapture/schemas/core';
import { $InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { Router } from 'express';

import { prisma } from '@/lib/prisma';
import { getActiveLanguages } from '@/lib/setup-state';
import { logger } from '@/logger';
import type { RootProps } from '@/Root';
import { ah } from '@/utils/async-handler';
import { generateToken } from '@/utils/auth';

const router = Router();

router.get(
  '/assignments/:id',
  ah(async (req, res, next) => {
    const id = req.params.id! as string;
    const assignment = await prisma.remoteAssignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      return next();
    } else if (assignment.completedAt) {
      return res
        .status(409)
        .set({ 'Content-Type': 'application/json' })
        .json({ error: 'Conflict', message: 'Assignment already completed', statusCode: 409 });
    }

    const targetParseResult = await $InstrumentBundleContainer.safeParseAsync(JSON.parse(assignment.targetStringified));
    if (!targetParseResult.success) {
      logger.error(targetParseResult.error.issues);
      return res.status(500).set({ 'Content-Type': 'application/json' }).json({
        error: 'Internal Server Error',
        message: 'Failed to parse target instrument from database',
        statusCode: 500
      });
    }

    let initialSeriesIndex: number | undefined;
    if (assignment.encryptedData?.startsWith('$')) {
      initialSeriesIndex = assignment.encryptedData.slice(1).split('$').length;
    }

    // Read server-side rather than from `window.location` so the SSR pass and the hydration pass
    // resolve the same language; anything else renders the page in English and then swaps it.
    const activeLanguages = getActiveLanguages();
    const requestedLanguage = $Language.safeParse(req.query.lang);
    const language =
      requestedLanguage.success && activeLanguages.includes(requestedLanguage.data)
        ? requestedLanguage.data
        : activeLanguages[0];

    const token = generateToken(assignment.id);
    const html = res.locals.loadRoot({
      activeLanguages,
      id,
      initialSeriesIndex,
      language,
      target: targetParseResult.data,
      token
    } satisfies RootProps);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  })
);

export { router as rootRouter };
