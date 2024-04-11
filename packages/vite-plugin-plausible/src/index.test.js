import { test } from 'vitest';

import { plausible } from './index.js';

test('plausiblePlugin', (t) => {
  const options = {
    baseUrl: 'https://example.com',
    dataDomain: 'example.com'
  };

  /** @type {any} */
  const plugin = plausible(options);

  t.expect(plugin.apply === 'build', 'Should have apply property set to "build"');
  t.expect(plugin.name === 'vite-plugin-plausible', 'Should have name property set to "vite-plugin-plausible"');

  const transform = plugin.transformIndexHtml();

  t.expect(transform.length === 1);
  t.expect(transform[0].tag === 'script');
  t.expect(transform[0].attrs['data-api']);
  t.expect(transform[0].attrs['data-domain'] === 'example.com');
  t.expect(transform[0].attrs.defer === true);
  t.expect(transform[0].attrs.src === 'https://example.com/js/script.js');
});
