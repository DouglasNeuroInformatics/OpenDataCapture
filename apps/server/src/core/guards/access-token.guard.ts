import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { Observable } from 'rxjs';

import { RouteAccessType } from '../decorators/route-access.decorator';

import { User } from '@/users/schemas/user.schema';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(AccessTokenGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const routeAccess = this.getRouteAccess(context);
    const isPublic = routeAccess === 'public';

    this.logger.verbose(`Public: ${Boolean(isPublic)}`);
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

  private getRouteAccess(context: ExecutionContext): RouteAccessType | undefined {
    return this.reflector.getAllAndOverride<RouteAccessType | undefined>('RouteAccess', [
      context.getHandler(),
      context.getClass()
    ]);
  }
}
