import type { RequestHandler } from 'express';

import { config } from '@/config';
import { generateToken } from '@/utils/auth';
import { HttpException } from '@/utils/http-exception';

export const apiKeyMiddleware: RequestHandler = (req, _, next) => {
  const key = req.headers.authorization?.match(/^Bearer (.+)$/i)?.at(1);
  const isHealthCheck = req.originalUrl === '/api/healthcheck';
  if (isHealthCheck) {
    return next();
  }
  if (key !== config.apiKey) {
    const assignmentId = /\/api\/assignments\/(.*)/.exec(req.originalUrl)?.at(1);
    const isAssignmentUpdate = assignmentId && req.method === 'PATCH';
    if (!isAssignmentUpdate) {
      throw new HttpException(401, 'Unauthorized');
    }
    const validToken = generateToken(assignmentId);
    if (key !== validToken) {
      throw new HttpException(401, 'Unauthorized');
    }
  }
  next();
};
