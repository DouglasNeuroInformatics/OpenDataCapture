import { InvalidCharacterError } from './exceptions';

export function sanitize(
  s: string,
  allowNumericChars = false,
  validSpecialChars = /[-\s]/g
): string {
  s = s
    .replace(validSpecialChars, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const invalidRegExp = allowNumericChars ? /[^A-Z0-9]/g : /[^A-Z]/g;
  const invalidChars = s.toUpperCase().match(invalidRegExp);
  if (invalidChars) {
    throw new InvalidCharacterError(invalidChars);
  }
  return s;
}
