import { Injectable } from '@nestjs/common';

import Ajv, { ErrorObject, JSONSchemaType } from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

@Injectable()
export class AjvService {
  private readonly ajv: Ajv;
  
  constructor() {
    this.ajv = new Ajv({ allErrors: true, coerceTypes: true, strict: true });
    addErrors(this.ajv);
    addFormats(this.ajv);
  }

  validate<T>(data: unknown, schema: JSONSchemaType<T>, onError: (message: unknown) => never): T {
    const validateFunction = this.ajv.compile(schema);
    const isValid = validateFunction(data);
    if (!isValid) {
      onError(this.formatErrorMessage(validateFunction.errors));
    }
    return data;
  }

  private formatErrorMessage(
    errors?: ErrorObject<string, Record<string, any>, unknown>[] | null
  ): string | Record<string, any> {
    if (!errors) {
      return 'Schema validation failed, yet errors is ' + errors;
    }
    return errors;
  }
}
