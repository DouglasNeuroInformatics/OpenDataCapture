export class Random {
  /** Returns a random integer between min and max, excluding max itself */
  static int(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /** Returns a random date  */
  static date(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /** Returns a random data between January 1950 and January 2000 */
  static birthday() {
    return this.date(new Date(1950, 0), new Date(2000, 0));
  }

  /** Returns a random value from the array */
  static value<T>(arr: T[]) {
    return arr[Random.int(0, arr.length)];
  }
}
