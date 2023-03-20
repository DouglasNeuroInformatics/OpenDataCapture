import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';
import { Observable } from 'rxjs';

import { RouteAccessType } from '@/core/decorators/route-access.decorator';
import { PermissionsFactory } from '@/permissions/permissions.factory';
import { User } from '@/users/schemas/user.schema';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(private readonly reflector: Reflector, private readonly permissionsFactory: PermissionsFactory) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
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

    const ability = this.permissionsFactory.createForUser(request.user as User);
    return ability.can(routeAccess.action, routeAccess.subject);
  }
}
