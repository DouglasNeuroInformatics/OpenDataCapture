/**
 * https://simplestatistics.org/docs/#addtomean
 */
export declare function addToMean(mean: number, n: number, newValue: number): number;

declare type BandwidthMethods = 'nrd';

/**
 * https://simplestatistics.org/docs/#bayesianclassifier
 */
declare class BayesianClassifier {
  public totalCount: number;
  public data: Data;
  train(item: Item, category: string): void;
  score(item: Item): OddsSums;
}
export { BayesianClassifier };
export { BayesianClassifier as bayesian };

/**
 * https://simplestatistics.org/docs/#bernoullidistribution
 */
export declare function bernoulliDistribution(p: number): number[];

/**
 * https://simplestatistics.org/docs/#binomialdistribution
 */
export declare function binomialDistribution(trials: number, probability: number): number[];

/**
 * https://simplestatistics.org/docs/#bisect
 */
export declare function bisect(
  func: (x: any) => number,
  start: number,
  end: number,
  maxIterations: number,
  errorTolerance: number
): number;

/**
 * https://simplestatistics.org/docs/#chisquareddistributiontable
 */
export declare const chiSquaredDistributionTable: {
  1: DistributionTable;
  2: DistributionTable;
  3: DistributionTable;
  4: DistributionTable;
  5: DistributionTable;
  6: DistributionTable;
  7: DistributionTable;
  8: DistributionTable;
  9: DistributionTable;
  10: DistributionTable;
  11: DistributionTable;
  12: DistributionTable;
  13: DistributionTable;
  14: DistributionTable;
  15: DistributionTable;
  16: DistributionTable;
  17: DistributionTable;
  18: DistributionTable;
  19: DistributionTable;
  20: DistributionTable;
  21: DistributionTable;
  22: DistributionTable;
  23: DistributionTable;
  24: DistributionTable;
  25: DistributionTable;
  26: DistributionTable;
  27: DistributionTable;
  28: DistributionTable;
  29: DistributionTable;
  30: DistributionTable;
  40: DistributionTable;
  50: DistributionTable;
  60: DistributionTable;
  70: DistributionTable;
  80: DistributionTable;
  90: DistributionTable;
  100: DistributionTable;
};

/**
 * https://simplestatistics.org/docs/#chisquaredgoodnessoffit
 */
export declare function chiSquaredGoodnessOfFit(
  data: number[],
  distributionType: Function,
  significance: number
): boolean;

/**
 * https://simplestatistics.org/docs/#chunk
 */
export declare function chunk<T extends any>(x: T[], chunkSize: number): T[][];

/**
 * https://simplestatistics.org/docs/#ckmeans
 */
export declare function ckmeans<T extends number[]>(x: T, nClusters: number): T[];

/**
 * https://simplestatistics.org/docs/#combinations
 */
export declare function combinations<T extends any[]>(x: T, k: number): T[];

/**
 * https://simplestatistics.org/docs/#combinationsreplacement
 */
export declare function combinationsReplacement<T extends any[]>(x: T, k: number): T[];

/**
 * https://simplestatistics.org/docs/#combinemeans
 */
export declare function combineMeans(mean1: number, n1: number, mean2: number, n2: number): number;

/**
 * https://simplestatistics.org/docs/#combinevariances
 */
export declare function combineVariances(
  variance1: number,
  mean1: number,
  n1: number,
  variance2: number,
  mean2: number,
  n2: number
): number;

/**
 * https://simplestatistics.org/docs/#cumulativestdnormalprobability
 */
export declare function cumulativeStdNormalProbability(z: number): number;

declare type Data = object;

declare interface DistributionTable {
  0.995: number;
  0.99: number;
  0.975: number;
  0.95: number;
  0.9: number;
  0.5: number;
  0.1: number;
  0.05: number;
  0.025: number;
  0.01: number;
  0.005: number;
}

/**
 * https://simplestatistics.org/docs/#epsilon
 */
export declare const epsilon: number;

/**
 * https://simplestatistics.org/docs/#equalintervalbreaks
 */
export declare function equalIntervalBreaks(x: number[], nClasses: number): number[];

/**
 * https://simplestatistics.org/docs/#errorfunction
 */
declare function errorFunction(x: number): number;
export { errorFunction as erf };
export { errorFunction };

/**
 * https://simplestatistics.org/docs/#extent
 */
export declare function extent(x: number[]): [number, number];

/**
 * https://simplestatistics.org/docs/#factorial
 */
export declare function factorial(n: number): number;

/**
 * https://simplestatistics.org/docs/#geometricmean
 */
export declare function geometricMean(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#harmonicmean
 */
export declare function harmonicMean(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#interquartilerange
 */
declare function interquartileRange(x: number[]): number;
export { interquartileRange };
export { interquartileRange as iqr };

/**
 * https://simplestatistics.org/docs/#inverseerrorfunction
 */
export declare function inverseErrorFunction(x: number): number;

declare type Item = object;

/**
 * https://simplestatistics.org/docs/#jenks
 */
export declare function jenks(data: number[], nClasses: number): number[];

/**
 * https://simplestatistics.org/docs/#kde
 */
declare function kernelDensityEstimation(
  X: number[],
  kernel?: Kernels | ((u: number) => number),
  bandwidthMethod?: BandwidthMethods | number
): (x: number) => number;
export { kernelDensityEstimation as kde };
export { kernelDensityEstimation };

declare type Kernels = 'gaussian';

/**
 * https://simplestatistics.org/docs/#k_means_cluster
 */
export declare function kMeansCluster(
  points: number[][],
  numCluster: number,
  randomSource?: () => number
): { labels: number[]; centroids: number[][] };

/**
 * https://simplestatistics.org/docs/#linearregression
 */
export declare function linearRegression(data: number[][]): { m: number; b: number };

/**
 * https://simplestatistics.org/docs/#linearregressionline
 */
export declare function linearRegressionLine(mb: { b: number; m: number }): (x: number) => number;

/**
 * https://simplestatistics.org/docs/#max
 */
export declare function max(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#maxsorted
 */
export declare function maxSorted(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#mean
 */
declare function mean(x: number[]): number;
export { mean as average };
export { mean };

/**
 * https://simplestatistics.org/docs/#median
 */
export declare function median(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#medianabsolutedeviation
 */
declare function medianAbsoluteDeviation(x: number[]): number;
export { medianAbsoluteDeviation as mad };
export { medianAbsoluteDeviation };

/**
 * https://simplestatistics.org/docs/#mediansorted
 */
export declare function medianSorted(sorted: number[]): number;

/**
 * https://simplestatistics.org/docs/#min
 */
export declare function min(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#minsorted
 */
export declare function minSorted(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#mode
 */
export declare function mode(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#modefast
 */
export declare function modeFast<T extends any>(x: T[]): T;

/**
 * https://simplestatistics.org/docs/#modesorted
 */
export declare function modeSorted(sorted: number[]): number;

/**
 * https://simplestatistics.org/docs/#numericsort
 */
export declare function numericSort(x: number[]): number[];

declare type OddsSums = object;

/**
 * https://simplestatistics.org/docs/#perceptronmodel
 */
declare class PerceptronModel {
  public weights: number[];
  public bias: number;
  predict(features: number[]): number;
  train(features: number[], label: number): PerceptronModel;
}
export { PerceptronModel };
export { PerceptronModel as perceptron };

/**
 * https://simplestatistics.org/docs/#permutationsheap
 */
export declare function permutationsHeap<T extends any[]>(elements: T): T[];

/**
 * https://simplestatistics.org/docs/#permutationstest
 */
export declare function permutationTest(
  sampleX: number[],
  sampleY: number[],
  string?: string,
  k?: number,
  randomSource?: () => number
): number;

/**
 * https://simplestatistics.org/docs/#poissondistribution
 */
export declare function poissonDistribution(lambda: number): number[];

/**
 * https://simplestatistics.org/docs/#probit
 */
export declare function probit(p: number): number;

/**
 * https://simplestatistics.org/docs/#product
 */
export declare function product(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#quantile
 */
export declare function quantile(x: number[], p: number): number;

export declare function quantile(x: number[], p: number[]): number[];

/**
 * https://simplestatistics.org/docs/#quantilerank
 */
export declare function quantileRank(x: number[], value: number): number;

/**
 * https://simplestatistics.org/docs/#quantileranksorted
 */
export declare function quantileRankSorted(x: number[], value: number): number;

/**
 * https://simplestatistics.org/docs/#quantilesorted
 */
export declare function quantileSorted(x: number[], p: number): number;

/**
 * https://simplestatistics.org/docs/#quickselect
 */
export declare function quickselect(arr: number[], k: number, left?: number, right?: number): void;

/**
 * https://simplestatistics.org/docs/#rootmeansquare
 */
declare function rootMeanSquare(x: number[]): number;
export { rootMeanSquare as rms };
export { rootMeanSquare };

/**
 * https://simplestatistics.org/docs/#rsquared
 */
export declare function rSquared(x: number[][], func: (x: number) => number): number;

/**
 * https://simplestatistics.org/docs/#sample
 */
export declare function sample<T extends any>(x: T[], n: number, randomSource: () => number): T[];

/**
 * https://simplestatistics.org/docs/#samplecorrelation
 */
export declare function sampleCorrelation(x: number[], y: number[]): number;

/**
 * https://simplestatistics.org/docs/#samplecovariance
 */
export declare function sampleCovariance(x: number[], y: number[]): number;

/**
 * https://simplestatistics.org/docs/#samplekurtosis
 */
export declare function sampleKurtosis(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#samplerankcorrelation
 */
export declare function sampleRankCorrelation(x: number[], y: number[]): number;

/**
 * https://simplestatistics.org/docs/#sampleskewness
 */
export declare function sampleSkewness(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#samplestandarddeviation
 */
export declare function sampleStandardDeviation(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#samplevariance
 */
export declare function sampleVariance(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#samplewithreplacement
 */
export declare function sampleWithReplacement<T extends any>(x: T[], n: number, randomSource?: () => number): T[];

/**
 * https://simplestatistics.org/docs/#shuffle
 */
export declare function shuffle<T extends any[]>(x: T, randomSource?: () => number): T;

/**
 * https://simplestatistics.org/docs/#shuffleinplace
 */
export declare function shuffleInPlace<T extends any[]>(x: T, randomSource?: () => number): T;

/**
 * https://simplestatistics.org/docs/#sign
 */
export declare function sign(x: number): number;

/**
 * https://simplestatistics.org/docs/#silhouette
 */
export declare function silhouette(points: number[][], labels: number[]): number[];

/**
 * https://simplestatistics.org/docs/#silhouettemetric
 */
export declare function silhouetteMetric(points: number[][], labels: number[]): number;

/**
 * https://simplestatistics.org/docs/#standarddeviation
 */
export declare function standardDeviation(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#standardnormaltable
 */
export declare const standardNormalTable: number[];

/**
 * https://simplestatistics.org/docs/#subtractfrommean
 */
export declare function subtractFromMean(mean: number, n: number, value: number): number;

/**
 * https://simplestatistics.org/docs/#sum
 */
export declare function sum(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#sumnthpowerdeviations
 */
export declare function sumNthPowerDeviations(x: number[], n?: number): number;

/**
 * https://simplestatistics.org/docs/#sumsimple
 */
export declare function sumSimple(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#ttest
 */
export declare function tTest(x: number[], expectedValue: number): number;

/**
 * https://simplestatistics.org/docs/#ttesttwosample
 */
export declare function tTestTwoSample(sampleX: number[], sampleY: number[], difference?: number): number | null;

/**
 * https://simplestatistics.org/docs/#uniquecountsorted
 */
export declare function uniqueCountSorted(x: any[]): number;

/**
 * https://simplestatistics.org/docs/#variance
 */
export declare function variance(x: number[]): number;

/**
 * https://simplestatistics.org/docs/#zscore
 */
export declare function zScore(x: number, mean: number, standardDeviation: number): number;
