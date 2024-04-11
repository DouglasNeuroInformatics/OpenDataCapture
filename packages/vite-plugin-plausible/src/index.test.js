import { test } from 'vitest';

import { plausible } from './index.js';

test('plausible', (ctx) => {
  const options = {
    baseUrl: 'https://example.com',
    dataDomain: 'example.com'
  };

  /** @type {any} */
  const plugin = plausible(options);

  ctx.expect(plugin.apply === 'build', 'Should have apply property set to "build"');
  ctx.expect(plugin.name === 'vite-plugin-plausible', 'Should have name property set to "vite-plugin-plausible"');

  const transform = plugin.transformIndexHtml();

  ctx.expect(transform.length === 1);
  ctx.expect(transform[0].tag === 'script');
  ctx.expect(transform[0].attrs['data-api']);
  ctx.expect(transform[0].attrs['data-domain'] === 'example.com');
  ctx.expect(transform[0].attrs.defer === true);
  ctx.expect(transform[0].attrs.src === 'https://example.com/js/script.js');
});
