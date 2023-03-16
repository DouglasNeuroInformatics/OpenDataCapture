import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { RawRuleOf } from '@casl/ability';

import { AppAbility } from '../permissions.types';

export function Permissions(value: RawRuleOf<AppAbility> | RawRuleOf<AppAbility>[]): CustomDecorator {
  return SetMetadata('Permissions', value);
}
