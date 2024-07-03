'use strict';

/**
 * Starlight uses the 'data-theme' attribute for dark mode, whereas
 * the rest of our stuff uses 'data-mode', as seems to be a defacto
 * standard in tailwind. This script synchronizes the two.
 */

const PRIMARY_THEME_KEY = 'theme';
const DOCS_THEME_KEY = 'starlight-theme';
const DOCS_THEME_ATTRIBUTE = 'data-theme';
const MAIN_THEME_ATTRIBUTE = 'data-mode';

const primaryTheme = window.localStorage.getItem(PRIMARY_THEME_KEY);
if (primaryTheme) {
  window.localStorage.setItem(DOCS_THEME_KEY, primaryTheme);
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === DOCS_THEME_ATTRIBUTE) {
      const target = /** @type {HTMLElement} */ (mutation.target);
      const updatedTheme = target.getAttribute(DOCS_THEME_ATTRIBUTE);
      if (updatedTheme === 'light' || updatedTheme === 'dark') {
        document.documentElement.setAttribute(MAIN_THEME_ATTRIBUTE, updatedTheme);
        window.localStorage.setItem(PRIMARY_THEME_KEY, updatedTheme);
      } else {
        console.error(`Unexpected value for '${DOCS_THEME_ATTRIBUTE}' attribute: ${updatedTheme}`);
      }
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true
});
