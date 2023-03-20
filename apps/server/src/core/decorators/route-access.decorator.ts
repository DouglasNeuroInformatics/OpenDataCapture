import { SetMetadata } from '@nestjs/common';

import { Action, Subject } from '@/permissions/permissions.types';

type PublicRouteAccess = 'public';

export type ProtectedRouteAccess = {
  action: Action;
  subject: Subject;
};

export type RouteAccessType = PublicRouteAccess | ProtectedRouteAccess;

export function RouteAccess(value: PublicRouteAccess): MethodDecorator;
export function RouteAccess(value: ProtectedRouteAccess): MethodDecorator;
export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata('RouteAccess', value);
}
