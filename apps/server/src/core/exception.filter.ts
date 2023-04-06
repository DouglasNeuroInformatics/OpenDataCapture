import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { Request } from 'express';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    this.logger.error(
      JSON.stringify({
        method: request.method,
        error: exception
      })
    );
    super.catch(exception, host);
  }
}
