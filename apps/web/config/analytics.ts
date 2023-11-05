import { type PluginOption } from 'vite';

export const analytics = (): PluginOption => ({
  apply: 'build',
  name: 'inject-analytics-script',
  transformIndexHtml: () => {
    if (!(process.env.PLAUSIBLE_BASE_URL && process.env.PLAUSIBLE_DATA_DOMAIN)) {
      return;
    }
    return [
      {
        attrs: {
          'data-api': process.env.PLAUSIBLE_BASE_URL + '/api/event',
          'data-domain': process.env.PLAUSIBLE_DATA_DOMAIN,
          defer: true,
          src: process.env.PLAUSIBLE_BASE_URL + '/js/script.js'
        },
        tag: 'script'
      }
    ];
  }
});
