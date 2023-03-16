import { CustomDecorator, SetMetadata } from '@nestjs/common';

import type { JSONSchemaType } from 'ajv';

export function ValidationSchema<T>(value: JSONSchemaType<T>): CustomDecorator {
  return SetMetadata('ValidationSchema', value);
}
