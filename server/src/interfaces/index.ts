import { Request, Response, NextFunction } from 'express';

export type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<Response>;

export interface HappinessQuestionnaireResponse {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  score: string;
}