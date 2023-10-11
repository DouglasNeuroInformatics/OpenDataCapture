import { AjvService } from '@douglasneuroinformatics/nestjs/modules';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JSONSchemaType } from 'ajv/dist/types/json-schema';


@Injectable()
export class ValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ValidationPipe.name);
  private readonly reflector = new Reflector();

  constructor(private readonly ajvService: AjvService) {}

  transform<T>(value: T, { metatype, type }: ArgumentMetadata): T {
    if (type !== 'body') {
      return value;
    }
    if (!metatype) {
      throw new InternalServerErrorException('Metatype must be defined!');
    }

    const schema = this.reflector.get<JSONSchemaType<T> | undefined>('ValidationSchema', metatype);
    if (!schema) {
      throw new InternalServerErrorException('Schema must be defined!');
    }

    this.logger.verbose(`Attempting to validate value: ${JSON.stringify(value)}`);

    const data = this.ajvService.validate<T>(value, schema, (errorMessage) => {
      throw new BadRequestException(errorMessage);
    });

    this.logger.verbose('Success!');
    return data;
  }
}
