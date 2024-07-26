use neon::prelude::*;

pub fn parse_number_array(cx: &mut FunctionContext, index: usize) -> Vec<f64> {
    let arr_handle = cx.argument::<JsArray>(index).unwrap();
    arr_handle
        .to_vec(cx)
        .unwrap()
        .iter()
        .map(|item| {
            let num = item.downcast::<JsNumber, _>(cx).unwrap();
            num.value(cx) as f64
        })
        .collect()
}
