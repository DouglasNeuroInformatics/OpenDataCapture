import {
  ArgumentMetadata,
  Injectable,
  InternalServerErrorException,
  Logger,
  PipeTransform,
  Type
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import Ajv from 'ajv';
import { JSONSchemaType, SomeJSONSchema } from 'ajv/dist/types/json-schema';

@Injectable()
export class AjvValidationPipe implements PipeTransform {
  private readonly ajv = new Ajv({ strict: true });
  private readonly logger = new Logger(AjvValidationPipe.name);
  private readonly reflector = new Reflector();

  transform<T>(value: T, { data, metatype, type }: ArgumentMetadata): T {
    this.logger.verbose(`Validating value: ${JSON.stringify(value)}`);

    const toValidate = type === 'body';
    if (!toValidate) {
      return value;
    }
    const validationSchema = this.extractValidationSchema<T>(metatype);
    if (!validationSchema) {
      throw new InternalServerErrorException('Failed to extract validation schema for request body');
    }
    console.log(validationSchema);
    return value;
  }

  private extractValidationSchema = <T, U = JSONSchemaType<T>>(metatype?: Type<unknown>): U | null => {
    return metatype ? this.reflector.get<U>('ValidationSchema', metatype) : null;
  };
}
