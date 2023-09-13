import { Injectable } from '@nestjs/common';

import { AjvFactory } from '@douglasneuroinformatics/ajv';
import { default as Ajv, ErrorObject, JSONSchemaType } from 'ajv';

@Injectable()
export class AjvService {
  private readonly ajv: Ajv.default;

  constructor() {
    this.ajv = AjvFactory.create();
  }

  validate<T>(data: unknown, schema: JSONSchemaType<T>, onError: (message: unknown) => never): T {
    const validateFunction = this.ajv.compile(schema);
    const isValid = validateFunction(data);
    if (!isValid) {
      onError(this.formatErrorMessage(validateFunction.errors));
    }
    return data;
  }

  private formatErrorMessage(errors?: ErrorObject[] | null): string | Record<string, any> {
    if (!errors) {
      return 'Schema validation failed, yet errors is ' + errors;
    }
    return errors;
  }
}
