import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';
import { Observable } from 'rxjs';

import { RouteAccessType } from '@/core/decorators/route-access.decorator.js';

/** Allows request to proceed if the route is public or the user provides a valid JWT */
@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.verbose(`Request URL: ${context.switchToHttp().getRequest<Request>().url}`);
    return this.isPublicRoute(context) || super.canActivate(context);
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    const routeAccess = this.reflector.getAllAndOverride<RouteAccessType | undefined>('RouteAccess', [
      context.getHandler(),
      context.getClass()
    ]);
    const result = routeAccess === 'public';
    this.logger.verbose(`Public Route: ${result}`);
    return result;
  }
}
