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
 * @typedef {{ bundle: string, instance: InstrumentStubInstance<T> & { id: string } }} InstrumentStub
 * @template T
 */

/**
 *
 * @param {() => Promise<InstrumentStubInstance<T>>} factory
 * @template T
 * @returns {Promise<InstrumentStub<T>>}
 */
export async function createInstrumentStub(factory) {
  return {
    bundle: `(${factory.toString()})()`,
    instance: /** @type InstrumentStubInstance<T> & { id: string } */ (
      deepFreeze({
        ...(await factory()),
        id: randomInt(100, 999).toString()
      })
    )
  };
}
