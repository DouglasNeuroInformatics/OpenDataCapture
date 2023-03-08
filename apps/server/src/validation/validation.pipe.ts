import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  PipeTransform
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv/dist/types/json-schema';

@Injectable()
export class ValidationPipe implements PipeTransform {
  private readonly ajv = new Ajv({ allErrors: true, strict: true });
  private readonly logger = new Logger(ValidationPipe.name);
  private readonly reflector = new Reflector();

  transform<T>(value: T, { metatype, type }: ArgumentMetadata): T {
    if (type !== 'body') {
      return value;
    }
    if (!metatype) {
      throw new InternalServerErrorException('Metatype must be defined!');
    }

    const schema = this.reflector.get<JSONSchemaType<T | undefined>>('ValidationSchema', metatype);
    if (!schema) {
      throw new InternalServerErrorException('Schema must be defined!');
    }

    this.logger.verbose(`Attempting to validate value: ${JSON.stringify(value)}`);

    const isValid = this.ajv.validate(schema, value);
    if (!isValid) {
      throw new BadRequestException(this.ajv.errors);
    }

    this.logger.verbose('Success!');
    return value;
  }
}
