import type { Request, Response, NextFunction } from 'express';

import { HttpError } from '../utils/exceptions';

type ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export const errorRequestHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  } else if (error instanceof HttpError) {
    return res.status(error.code || 500).json({
      message: error.message || 'An unknown error occured',
    });
  }
};
