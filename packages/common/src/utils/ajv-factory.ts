import Ajv from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

export class AjvFactory {
  static create() {
    const ajv = new Ajv({ allErrors: true, coerceTypes: true, strict: true });
    addErrors(ajv);
    addFormats(ajv);
    return ajv;
  }
}
