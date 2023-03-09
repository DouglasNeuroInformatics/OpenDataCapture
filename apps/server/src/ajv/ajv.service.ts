import { Injectable } from '@nestjs/common';

import Ajv, { ErrorObject, JSONSchemaType } from 'ajv';

@Injectable()
export class AjvService {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: true });
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
