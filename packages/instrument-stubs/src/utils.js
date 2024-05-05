import { deepFreeze, randomInt } from '@douglasneuroinformatics/libjs';

/**
 * @typedef {{ bundle: string, instance: T & { id: string }, source: string }} InstrumentStub
 * @template T
 */

/**
 * Create an instrument stub from a factory function. It is assumed that the factory function
 * is completely self-contained - that is, that it does not rely on any values outside of the
 * function body. It also assumes that the function is written in vanilla JavaScript only, and
 * that it can be directly interpreted by the browser as a bundle. This is then used to derive
 * a synthetic source, which exports the result of the executed bundle, that can be used to
 * generate a new bundle.
 * @param {() => Promise<T>} factory
 * @template T
 * @returns {Promise<InstrumentStub<T>>}
 */
export async function createInstrumentStub(factory) {
  const bundle = `(${factory.toString()})()`;
  return {
    bundle,
    instance: deepFreeze(
      {
        ...(await factory()),
        id: randomInt(100, 999).toString()
      },
      { readonlyType: false }
    ),
    source: `export default await ${bundle}`
  };
}
