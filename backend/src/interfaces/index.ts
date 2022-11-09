import type { Request, Response, NextFunction } from 'express';

export type Controller = (req: Request, res: Response, next: NextFunction) => void

export type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>

export type ErrorController = (error: unknown, req: Request, res: Response, next: NextFunction) => void