import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Observable } from 'rxjs';

import { RouteAccessType } from '@/core/decorators/route-access.decorator';
import { AuthenticatedRequest } from '@/core/interfaces/authenticated-request.interface';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    this.logger.verbose(`Request URL: ${request.url}`);

    const routeAccess = this.reflector.getAllAndOverride<RouteAccessType | undefined>('RouteAccess', [
      context.getHandler(),
      context.getClass()
    ]);

    if (routeAccess === 'public') {
      return true;
    } else if (!routeAccess) {
      return false;
    }

    return request.ability.can(routeAccess.action, routeAccess.subject);
  }
}
