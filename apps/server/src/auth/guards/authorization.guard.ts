import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    return true;
  }
}
