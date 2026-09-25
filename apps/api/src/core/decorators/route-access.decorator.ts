import { SetMetadata } from '@nestjs/common';

import type { AppAction, AppSubjectName } from '../../auth/auth.types.js';

const ROUTE_ACCESS_METADATA_KEY = 'ODC_ROUTE_ACCESS_TOKEN';

export type PublicRouteAccess = 'public';

export type ProtectedRoutePermissionSet = {
  action: AppAction;
  subject: AppSubjectName;
};

export type ProtectedRouteAccess = ProtectedRoutePermissionSet | ProtectedRoutePermissionSet[];

export type RouteAccessType = ProtectedRouteAccess | PublicRouteAccess;

/**
 * The declaration for a route only an administrator may reach. Any narrower one is satisfied by a
 * conditional rule or a granted additional permission, since the guard sees only the subject type.
 */
export const ADMIN_ONLY = { action: 'manage', subject: 'all' } as const satisfies ProtectedRoutePermissionSet;

export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata(ROUTE_ACCESS_METADATA_KEY, value);
}

export { ROUTE_ACCESS_METADATA_KEY };
