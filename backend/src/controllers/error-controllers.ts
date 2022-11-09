import { ErrorController } from '../interfaces';
import { HttpError } from '../utils/exceptions';

export const errorRequestHandler: ErrorController = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  } else if (error instanceof HttpError) {
    return res.status(error.code || 500).json({
      message: error.message || 'An unknown error occured',
    });
  }
};
