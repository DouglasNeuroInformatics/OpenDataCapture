import { expect, test } from 'vitest';

import { parse } from '../parse.js';

const code = `
import React, { useState } from 'react';
import { App } from './App.tsx';
await (async function () {
  const { sayHello } = await import('/hello.js');
  sayHello();
})();
export const foo = null;
export default foo;
`;

test('parse', () => {
  const result = parse(code);
  expect(result).toMatchObject({
    exports: [{ exportName: 'foo' }, { exportName: 'default' }],
    imports: [
      {
        importPath: 'react',
        importType: 'Static',
        statement: "import React, { useState } from 'react'"
      },
      {
        importPath: './App.tsx',
        importType: 'Static',
        statement: "import { App } from './App.tsx'"
      },
      {
        importPath: '/hello.js',
        importType: 'Dynamic',
        statement: "import('/hello.js')"
      }
    ]
  });
});
