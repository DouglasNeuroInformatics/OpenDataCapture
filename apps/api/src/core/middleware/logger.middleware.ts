import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';

import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { baseUrl, ip, method } = req;
    const start = new Date();

    res.on('close', () => {
      this.logger.log(`${start.toString()} ${ip} ${method} ${baseUrl} ${res.statusCode}`);
    });

    next();
  }
}
