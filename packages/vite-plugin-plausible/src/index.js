/**
 *
 * @param {object} options
 * @param {string} options.baseUrl
 * @param {string} options.dataDomain
 * @returns {import('vite').PluginOption}
 */
export const plausible = (options) => ({
  apply: 'build',
  name: 'vite-plugin-plausible',
  transformIndexHtml: () => [
    {
      attrs: {
        'data-api': options.baseUrl + '/api/event',
        'data-domain': options.dataDomain,
        defer: true,
        src: options.baseUrl + '/js/script.js'
      },
      tag: 'script'
    }
  ]
});
