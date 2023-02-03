export class Stats {
  static mean(arr: number[], digits?: number): number {
    const value = arr.reduce((a, b) => a + b) / arr.length;
    return this.round(value, digits ?? Infinity);
  }

  static median(arr: number[], digits?: number): number {
    arr.sort((a, b) => a - b);
    const middle = Math.floor(arr.length / 2);
    const value = arr.length % 2 === 0 ? (arr[middle - 1] + arr[middle]) / 2 : arr[middle];
    return this.round(value, digits ?? Infinity);
  }

  static std(arr: number[], digits?: number) {
    const mean = this.mean(arr);
    const deviations = arr.map((n) => Math.pow(n - mean, 2));
    const variance = deviations.reduce((a, b) => a + b) / deviations.length;
    return this.round(Math.sqrt(variance), digits ?? Infinity);
  }

  static round(value: number, digits: number): number {
    return digits === Infinity ? value : parseFloat(value.toFixed(digits));
  }
}
