export async function evaluateInstrument(bundle) {
  return await new Function(`return ${bundle}`)();
}
