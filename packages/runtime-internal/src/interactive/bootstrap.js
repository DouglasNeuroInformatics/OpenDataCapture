'use strict';

const THEME_ATTRIBUTE = 'data-mode';

/** @param {any} data */
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

(async function () {
  const { decodeBase64ToUnicode, evaluateInstrument } = await import('../index.js');

  /** @type {import('../../../runtime-core/src/types/instrument.interactive.js').InteractiveInstrument} */
  const instrument = await evaluateInstrument(bundle);
  if (instrument.content.staticAssets) {
    await navigator.serviceWorker.register('./worker.js', {
      scope: './'
    });
    await navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        staticAssets: instrument.content.staticAssets,
        type: 'STATIC_ASSETS'
      });
    });
  }

  if (instrument.content.meta) {
    Object.entries(instrument.content.meta).forEach(([name, content]) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    });
  }

  const encodedStyle = instrument.content.__injectHead?.style;
  if (encodedStyle) {
    const style = decodeBase64ToUnicode(encodedStyle);
    document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`);
  }

  if (instrument.content.html) {
    document.body.insertAdjacentHTML('beforeend', instrument.content.html);
  }

  const scripts = instrument.content.__injectHead?.scripts;
  scripts?.forEach((encodedScript) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = decodeBase64ToUnicode(encodedScript);
    document.head.appendChild(script);
  });

  await instrument.content.render(done);
})();
