export default class StringUtils {
  static isInt(s: string): boolean {
    return s ? parseInt(s).toString().length === s.length : false;
  }

  static sanitize(s: string, allowNumericChars = false, validSpecialChars = /[-\s]/g): string {
    s = s
      .toUpperCase()
      .replace(validSpecialChars, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const invalidRegExp = allowNumericChars ? /[^A-Z0-9]/g : /[^A-Z]/g;
    const invalidChars = s.toUpperCase().match(invalidRegExp);
    if (invalidChars) {
      throw new Error(`The following characters are invalid: ${invalidChars.join(', ')}`);
    }
    return s;
  }
}
