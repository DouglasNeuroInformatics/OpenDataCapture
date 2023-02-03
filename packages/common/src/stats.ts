export class Stats {
  static mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b) / arr.length;
  }

  static median(arr: number[]): number {
    arr.sort((a, b) => a - b);
    const middle = Math.floor(arr.length / 2);
    if (arr.length % 2 === 0) {
      return (arr[middle - 1] + arr[middle]) / 2;
    }
    return arr[middle];
  }

  static std(arr: number[]) {
    const mean = this.mean(arr);
    const deviations = arr.map((n) => Math.pow(n - mean, 2));
    const variance = deviations.reduce((a, b) => a + b) / deviations.length;
    return Math.sqrt(variance);
  }
}
