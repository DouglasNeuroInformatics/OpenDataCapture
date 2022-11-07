import type { ErrorRequestHandler } from 'express';

export const errorRequestHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  console.error(error);
  return res.status(error.code || 500).json({
    message: error.message || 'An unknown error occured'
  });
};
