import { SetMetadata, applyDecorators } from '@nestjs/common';

import { UserRole } from '@/users/users.types';

const enum AuthKeys {
  AuthorizedRoles,
  IsPublic
}

interface PublicRouteOptions {
  access: 'public';
}

interface ProtectedRouteOptions {
  access?: 'protected';
  authorizedRoles: UserRole[];
}

type AuthOptions = PublicRouteOptions | ProtectedRouteOptions;

const Auth = (options: AuthOptions): any => {
  if (options.access === 'public') {
    return SetMetadata(AuthKeys.IsPublic, true);
  }
  return applyDecorators(SetMetadata(AuthKeys.AuthorizedRoles, options.authorizedRoles));
};

export { Auth, AuthKeys };
