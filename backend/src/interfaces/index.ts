import type { Request, Response, NextFunction } from 'express';

export interface Controller {
  (req: Request, res: Response, next: NextFunction): void
}

export interface AsyncController {
  (req: Request, res: Response, next: NextFunction): Promise<void>
}

export interface ErrorController {
  (error: unknown, req: Request, res: Response, next: NextFunction): void
}