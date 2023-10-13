import { registerDecorator } from 'class-validator';
import type { ValidationArguments, ValidationOptions } from 'class-validator';

export function IsInstrumentLanguage(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isInstrumentLanguage',
      options: validationOptions,
      propertyName: propertyName,
      target: object.constructor,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          console.log(value, args);
          return true;
        }
      }
    });
  };
}
