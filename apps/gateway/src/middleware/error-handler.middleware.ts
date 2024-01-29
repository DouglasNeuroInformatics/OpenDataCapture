import type { ErrorRequestHandler } from 'express';

import { HttpException } from '@/utils/http-exception';

export const errorHandlerMiddleware: ErrorRequestHandler = (err, _, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  } else if (err instanceof HttpException) {
    res.status(err.status).send({ message: err.message, statusCode: err.status });
  } else {
    res.status(500).send({ message: 'Internal Server Error', statusCode: 500 });
  }
};
