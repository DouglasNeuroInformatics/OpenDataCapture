import { Injectable } from '@nestjs/common';

import Ajv, { ErrorObject, JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';

@Injectable()
export class AjvService {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, coerceTypes: true, strict: true });
    addFormats(this.ajv);
  }

  validate<T>(data: unknown, schema: JSONSchemaType<T>, onError: (message: string) => never): T {
    const validateFunction = this.ajv.compile(schema);
    const isValid = validateFunction(data);
    if (!isValid) {
      onError(this.formatErrorMessage(validateFunction.errors));
    }
    return data;
  }

  private formatErrorMessage(errors?: ErrorObject<string, Record<string, any>, unknown>[] | null): string {
    if (!errors) {
      return 'Schema validation failed, yet errors is ' + errors;
    }
    return JSON.stringify(errors);
  }
}
