export declare function sum(arr: number[]): number;
export declare function mean(arr: number[]): number;
export declare function std(arr: number[], isPopulation?: boolean): number;
export declare function linearRegression(arr: [number, number][]): {
  intercept: number;
  slope: number;
  stdErr: number;
};
