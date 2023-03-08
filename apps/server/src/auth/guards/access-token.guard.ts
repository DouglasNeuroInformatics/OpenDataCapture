import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';

import { AuthKeys } from '../decorators/auth.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(AccessTokenGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(AuthKeys.IsPublic, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const isValidToken = await super.canActivate(context);

    if (!isValidToken) {
      return false;
    }
    const request = this.getRequest(context);
    this.logger.log(request.user);

    return super.canActivate(context);
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }
}
