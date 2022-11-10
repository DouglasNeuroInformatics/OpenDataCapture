export default class StringUtils {
  static isInteger(s: string): boolean {
    return s ? parseInt(s).toString().length === s.length : false;
  }
}
