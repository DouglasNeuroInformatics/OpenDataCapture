function sum(arr: number[]): number;

function mean(arr: number[]): number;

function std(arr: number[], isPopulation?: boolean): number;

function linearRegression(arr: [number, number][]): {
  intercept: number;
  slope: number;
  stdErr: number;
};

export = { linearRegression, mean, std, sum };
