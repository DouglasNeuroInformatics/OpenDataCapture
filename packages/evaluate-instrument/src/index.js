/** @type {import('./index.d.ts').evaluateInstrument} */
export async function evaluateInstrument(bundle) {
  return await new Function(`return ${bundle}`)();
}
