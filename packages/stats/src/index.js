/**
 * Calculate the sum of all values in the array
 * @param {number[]} arr
 * @returns {number}
 */
export function sum(arr) {
  if (arr.length === 0) {
    return NaN;
  }
  return arr.reduce((prev, current) => prev + current, 0);
}

/**
 * Calculate the mean of all values in the array
 * @param {number[]} arr
 * @returns {number}
 */
export function mean(arr) {
  if (arr.length === 0) {
    return NaN;
  }
  return sum(arr) / arr.length;
}

/**
 * Calculate the standard deviation of all values in the array
 * @param {number[]} arr
 * @param {boolean} isPopulation
 * @returns {number}
 */
export function std(arr, isPopulation = false) {
  if (arr.length < 2) {
    return NaN;
  }
  const m = mean(arr);
  const ss = sum(arr.map((k) => (k - m) ** 2));
  const variance = ss / (arr.length - Number(!isPopulation));
  return Math.sqrt(variance);
}

/**
 * Compute a linear model for an array of data points of the format [x, y]
 * @param {[number, number][]} arr
 * @returns {{ intercept: number; slope: number; stdErr: number; }}
 */
export function linearRegression(arr) {
  const n = arr.length;
  const x = arr.map((point) => point[0]);
  const y = arr.map((point) => point[1]);
  const xMean = x.reduce((sum2, val) => sum2 + val, 0) / n;
  const yMean = y.reduce((sum2, val) => sum2 + val, 0) / n;
  let xySum = 0;
  let xSquaredSum = 0;
  for (let i = 0; i < n; i++) {
    xySum += x[i] * y[i];
    xSquaredSum += x[i] * x[i];
  }
  const slope = (xySum - n * xMean * yMean) / (xSquaredSum - n * xMean * xMean);
  const intercept = yMean - slope * xMean;
  const residuals = [];
  let residualsSquaredSum = 0;
  for (let i = 0; i < n; i++) {
    const residual = y[i] - (slope * x[i] + intercept);
    residuals.push(residual);
    residualsSquaredSum += residual * residual;
  }
  const stdErr = Math.sqrt(residualsSquaredSum / (n - 2)) / Math.sqrt(xSquaredSum - n * xMean * xMean);
  return { intercept, slope, stdErr };
}
