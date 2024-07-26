#[derive(Debug)]
pub struct LinearRegressionResult {
    pub intercept: f64,
    pub slope: f64,
    pub std_err: f64,
}

pub fn sum(arr: &[f64]) -> f64 {
    if arr.is_empty() {
        return f64::NAN;
    }
    arr.iter().sum()
}

pub fn mean(arr: &[f64]) -> f64 {
    if arr.is_empty() {
        return f64::NAN;
    }
    sum(arr) / arr.len() as f64
}

pub fn std(arr: &[f64], is_population: bool) -> f64 {
    if arr.len() < 2 {
        return f64::NAN;
    }
    let m = mean(arr);
    let ss: f64 = arr.iter().map(|&k| (k - m).powi(2)).sum();
    let variance = ss / (arr.len() as f64 - if is_population { 0.0 } else { 1.0 });
    variance.sqrt()
}

pub fn linear_regression(arr: &Vec<(f64, f64)>) -> LinearRegressionResult {
    let n = arr.len() as f64;
    let x: Vec<f64> = arr.iter().map(|point| point.0).collect();
    let y: Vec<f64> = arr.iter().map(|point| point.1).collect();

    let x_mean = x.iter().sum::<f64>() / n;
    let y_mean = y.iter().sum::<f64>() / n;

    let mut xy_sum = 0.0;
    let mut x_squared_sum = 0.0;

    for i in 0..arr.len() {
        xy_sum += x[i] * y[i];
        x_squared_sum += x[i] * x[i];
    }

    let slope = (xy_sum - n * x_mean * y_mean) / (x_squared_sum - n * x_mean * x_mean);
    let intercept = y_mean - slope * x_mean;

    let mut residuals_squared_sum = 0.0;

    for i in 0..arr.len() {
        let residual = y[i] - (slope * x[i] + intercept);
        residuals_squared_sum += residual * residual;
    }

    let std_err = (residuals_squared_sum / (n - 2.0)).sqrt() / (x_squared_sum - n * x_mean * x_mean).sqrt();

    LinearRegressionResult {
        intercept,
        slope,
        std_err,
    }
}
