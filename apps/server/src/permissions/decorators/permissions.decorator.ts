import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { type Permissions } from '../permissions.types';

export function Permissions(permissions: Permissions): CustomDecorator {
  return SetMetadata('Permissions', permissions);
}
