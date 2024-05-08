/**
 * This script is inserted (raw) into the InteractiveContent iframe. It is therefore assumed that
 * the `evaluateInstrument` import will be available at runtime, which is why this package has
 * @opendatacapture/runtime-v1 specified as a peer dependency.
 */

const { evaluateInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/internal.js');

const THEME_ATTRIBUTE = 'data-mode';

/** @typedef {import('@douglasneuroinformatics/libui/hooks').Theme} Theme */
/** @typedef {import('@opendatacapture/schemas/core').Json} Json */
/** @typedef {import('@opendatacapture/schemas/instrument').InteractiveInstrument} InteractiveInstrument */

/** @param {Json} data */
function done(data) {
  window.parent.document.dispatchEvent(new CustomEvent('done', { detail: data }));
}

// Set the iframe theme based on parent document
const parentTheme = parent.document.documentElement.getAttribute(THEME_ATTRIBUTE);
if (parentTheme === 'dark' || parentTheme === 'light') {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, parentTheme);
} else {
  console.error(`Unexpected value for 'data-mode' attribute in parent document element: '${parentTheme}'`);
}

// Synchronize the iframe theme with the parent document
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === THEME_ATTRIBUTE) {
      const target = /** @type {HTMLElement} */ (mutation.target);
      const updatedTheme = target.getAttribute(THEME_ATTRIBUTE);
      if (updatedTheme === 'light' || updatedTheme === 'dark') {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, updatedTheme);
      } else {
        console.error(`Unexpected value for 'data-mode' attribute in parent document element: '${updatedTheme}'`);
      }
    }
  });
});

observer.observe(parent.document.documentElement, {
  attributes: true
});

// Render the instrument to the user
const bundle = frameElement?.getAttribute('data-bundle');
if (!bundle) {
  // Perhaps we could send an event back to the parent here
  throw new Error("Failed to get 'data-bundle' attribute from frame element");
}

const instrument = await evaluateInstrument(bundle);
const encodedStyle = instrument.content.__injectHead?.style;
if (encodedStyle) {
  const style = atob(encodedStyle);
  document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`);
}

await instrument.content.render(done);
