export default class Random {
  static int(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static date(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  static birthday(): Date {
    return this.date(new Date(1950, 0), new Date(2000, 0));
  }
}
