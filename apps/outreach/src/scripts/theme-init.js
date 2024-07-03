'use strict';

/**
 * This script is injected inline to prevent a flash of content with the wrong theme, which
 * would happen if this was a module. Since this is run before all modules, it is safe to
 * assume that the document element will have the 'data-mode' attribute in all processed code.
 */

let theme = window.localStorage.getItem('theme');
if (!(theme === 'dark' || theme === 'light')) {
  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

document.documentElement.setAttribute('data-mode', theme);
window.localStorage.setItem('theme', theme);
