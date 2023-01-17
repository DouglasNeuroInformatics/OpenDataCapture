export class Random {
  static int(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static date(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  static birthday() {
    return this.date(new Date(1950, 0), new Date(2000, 0));
  }
}
