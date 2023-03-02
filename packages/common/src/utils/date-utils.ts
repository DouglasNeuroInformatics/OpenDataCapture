export class DateUtils {
  /** Returns the data in basic ISO format, e.g., yyyy-mm-dd */
  static toBasicISOString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /** Return the number of years since the date, rounded down */
  static yearsPassed(date: Date): number {
    return new Date(Date.now() - date.getTime()).getFullYear() - 1970;
  }
}
