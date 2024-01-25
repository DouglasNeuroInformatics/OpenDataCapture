import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function ah<T extends AsyncRequestHandler>(fn: T): RequestHandler {
  return (req, res, next) => void fn(req, res, next).catch(next);
}
