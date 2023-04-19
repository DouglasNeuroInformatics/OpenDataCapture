import { SetMetadata } from '@nestjs/common';

import { AppAction, AppSubject } from '@douglasneuroinformatics/common/auth';

type PublicRouteAccess = 'public';

export type ProtectedRouteAccess = {
  action: AppAction;
  subject: AppSubject;
};

export type RouteAccessType = PublicRouteAccess | ProtectedRouteAccess;

export function RouteAccess(value: PublicRouteAccess): MethodDecorator;
export function RouteAccess(value: ProtectedRouteAccess): MethodDecorator;
export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata('RouteAccess', value);
}
