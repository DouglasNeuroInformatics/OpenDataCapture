import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, path: url } = req;
    // const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || '';
      const delay = Date.now() - start;
      this.logger.log(`Delay: ${delay}ms`);
      this.logger.log(`${method} ${url} ${statusCode} ${contentLength} - ${ip}`);
    });

    next();
  }
}
