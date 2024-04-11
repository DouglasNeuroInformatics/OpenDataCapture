import { deepFreeze, randomInt } from '@douglasneuroinformatics/libjs';

/**
 * @typedef {import('@opendatacapture/schemas/core').Json} Json
 * @typedef {import('@opendatacapture/schemas/instrument').FormDataType} FormDataType
 * @typedef {import('@opendatacapture/schemas/instrument').InstrumentLanguage} InstrumentLanguage
 */

/**
 * @typedef {import('@opendatacapture/schemas/instrument').FormInstrument<TData, TLanguage>} FormInstrument
 * @template {FormDataType} TData
 * @template {InstrumentLanguage} TLanguage
 */

/**
 * @typedef {import('@opendatacapture/schemas/instrument').InteractiveInstrument<TData>} InteractiveInstrument
 * @template {Json} TData
 */

/**
 * @typedef { T extends FormInstrument<infer TData extends FormDataType, infer TLanguage extends InstrumentLanguage> ? FormInstrument<TData, TLanguage> : T extends InteractiveInstrument<infer TData extends Json> ? InteractiveInstrument<TData> : never } InstrumentStubInstance
 * @template T
 */

/**
 * @typedef {{ bundle: string, instance: InstrumentStubInstance<T> & { id: string }, source: string }} InstrumentStub
 * @template T
 */

/**
 * Create an instrument stub from a factory function. It is assumed that the factory function
 * is completely self-contained - that is, that it does not rely on any values outside of the
 * function body. It also assumes that the function is written in vanilla JavaScript only, and
 * that it can be directly interpreted by the browser as a bundle. This is then used to derive
 * a synthetic source, which exports the result of the executed bundle, that can be used to
 * generate a new bundle.
 * @param {() => Promise<InstrumentStubInstance<T>>} factory
 * @template T
 * @returns {Promise<InstrumentStub<T>>}
 */
export async function createInstrumentStub(factory) {
  const bundle = `(${factory.toString()})()`;
  return {
    bundle,
    instance: /** @type InstrumentStubInstance<T> & { id: string } */ (
      deepFreeze({
        ...(await factory()),
        id: randomInt(100, 999).toString()
      })
    ),
    source: `export default await ${bundle}`
  };
}
