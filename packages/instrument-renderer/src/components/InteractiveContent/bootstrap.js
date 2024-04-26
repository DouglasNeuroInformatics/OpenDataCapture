/**
 * This script is inserted (raw) into the InteractiveContent iframe. It is therefore assumed that
 * the `evaluateInstrument` import will be available at runtime, which is why this package has
 * @opendatacapture/runtime-v1 specified as a peer dependency.
 */

const { evaluateInstrument } = await import('/runtime/v1/@opendatacapture/evaluate-instrument.js');

/** @typedef {import('@opendatacapture/schemas/core').Json} Json */
/** @typedef {import('@opendatacapture/schemas/instrument').InteractiveInstrument} InteractiveInstrument */

/** @param {Json} data */
function done(data) {
  window.parent.document.dispatchEvent(new CustomEvent('done', { detail: data }));
}

/** @param {MessageEvent<{ payload: string; type: string }>} event */
async function handleMessageEvent(event) {
  /** @type {InteractiveInstrument} */
  const instrument = await evaluateInstrument(event.data.payload);
  const encodedStyle = instrument.content.__injectHead?.style;
  if (encodedStyle) {
    const style = atob(encodedStyle);
    document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`);
  }
  instrument.content.render(done);
}

window.addEventListener('message', handleMessageEvent);
