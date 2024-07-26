mod core;
mod javascript;

use core::{linear_regression, mean, std, sum};
use javascript::parse_number_array;
use neon::prelude::*;

fn js_sum(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let vec = parse_number_array(&mut cx, 0);
    Ok(cx.number(sum(&vec)))
}

fn js_mean(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let vec = parse_number_array(&mut cx, 0);
    Ok(cx.number(mean(&vec)))
}

fn js_std(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let vec = parse_number_array(&mut cx, 0);
    let is_population: bool = match cx.argument_opt(1) {
        Some(js_value) => {
            let handle = js_value.downcast::<JsBoolean, _>(&mut cx).unwrap();
            handle.value(&mut cx) as bool
        }
        None => false,
    };
    Ok(cx.number(std(&vec, is_population)))
}

fn js_linear_regression(mut cx: FunctionContext) -> JsResult<JsObject> {
    let arr_handle = cx.argument::<JsArray>(0).unwrap();

    let n = arr_handle.len(&mut cx);
    if n == 0 {
        return cx.throw_error("Array cannot be empty");
    }

    let mut matrix: Vec<(f64, f64)> = Vec::new();
    for handle in arr_handle.to_vec(&mut cx).unwrap().iter() {
        let tuple_handle: Handle<JsArray> = handle.downcast::<JsArray, _>(&mut cx).unwrap();
        let values: Vec<f64> = tuple_handle
            .to_vec(&mut cx)
            .unwrap()
            .iter()
            .map(|item| {
                let num = item.downcast::<JsNumber, _>(&mut cx).unwrap();
                num.value(&mut cx) as f64
            })
            .collect();
        matrix.push((values[0], values[1]));
    }

    let result = linear_regression(&matrix);

    let obj = JsObject::new(&mut cx);

    let intercept = cx.number(result.intercept);
    let slope = cx.number(result.slope);
    let std_err = cx.number(result.std_err);

    obj.set(&mut cx, "intercept", intercept)?;
    obj.set(&mut cx, "slope", slope)?;
    obj.set(&mut cx, "stdErr", std_err)?;

    Ok(obj)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("sum", js_sum)?;
    cx.export_function("mean", js_mean)?;
    cx.export_function("std", js_std)?;
    cx.export_function("linearRegression", js_linear_regression)?;
    Ok(())
}
