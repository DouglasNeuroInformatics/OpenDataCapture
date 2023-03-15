import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { Observable } from 'rxjs';

import { AuthKeys } from '../decorators/auth.decorator';
import { StrategyName } from '../enum/strategy-name.enum';

import { User } from '@/users/schemas/user.schema';

@Injectable()
export class AccessTokenGuard extends AuthGuard(StrategyName.AccessToken) {
  private readonly logger = new Logger(AccessTokenGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(AuthKeys.IsPublic, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<T = User>(error: unknown, user?: T): T {
    if (error || !user) {
      throw error || new UnauthorizedException();
    }
    return user;
  }
}
