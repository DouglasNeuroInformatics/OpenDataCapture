import type { RequestHandler } from 'express';

import { CONFIG } from '@/config';
import { HttpException } from '@/utils/http-exception';

export const apiKeyMiddleware: RequestHandler = (req, _, next) => {
  const key = req.headers.authorization?.match(/^Bearer (.+)$/i)?.at(1);
  if (key !== CONFIG.apiKey) {
    throw new HttpException(401, 'Unauthorized');
  }
  next();
};
