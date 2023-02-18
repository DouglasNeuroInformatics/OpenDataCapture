export class DateUtils {
  /** Returns the data in basic ISO format, e.g., yyyy-mm-dd */
  static toBasicISOString(date: Date) {
    return date.toISOString().split('T')[0];
  }
}
