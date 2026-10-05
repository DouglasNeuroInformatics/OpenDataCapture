import { describe, expect, it, test } from 'vitest';

import { InstrumentBundlerError } from '../error.js';
import { parse, parseImports, parseModuleSpecifier } from '../parse.js';

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

describe('parseModuleSpecifier', () => {
  it('should classify an empty specifier as invalid', () => {
    expect(parseModuleSpecifier(`''`, { isDynamicImport: false }).type).toBe('invalid');
  });

  it('should classify a specifier starting with a dot as relative', () => {
    expect(parseModuleSpecifier(`'./App.tsx'`, { isDynamicImport: false }).type).toBe('relative');
  });

  it('should classify a specifier starting with a slash as absolute', () => {
    expect(parseModuleSpecifier(`'/hello.js'`, { isDynamicImport: false }).type).toBe('absolute');
  });

  it('should classify a bare specifier as a package', () => {
    expect(parseModuleSpecifier(`'react'`, { isDynamicImport: false }).type).toBe('package');
  });

  it('should treat a dynamic import of an expression as non-constant with an unknown type', () => {
    expect(parseModuleSpecifier('moduleName', { isDynamicImport: true })).toMatchObject({
      isConstant: false,
      type: 'unknown',
      value: undefined
    });
  });

  it('should treat a string literal closed before its end as non-constant', () => {
    expect(parseModuleSpecifier(`'a' + 'b'`, { isDynamicImport: true }).isConstant).toBe(false);
  });

  it('should unescape an escaped quote inside a constant string literal', () => {
    expect(parseModuleSpecifier(`'it\\'s'`, { isDynamicImport: true })).toMatchObject({
      isConstant: true,
      value: "it's"
    });
  });

  it('should treat a template literal with an interpolation as non-constant', () => {
    expect(parseModuleSpecifier('`./${name}.js`', { isDynamicImport: true }).isConstant).toBe(false);
  });

  it('should treat a template literal without an interpolation as constant', () => {
    expect(parseModuleSpecifier('`./a.js`', { isDynamicImport: true })).toMatchObject({
      isConstant: true,
      value: './a.js'
    });
  });

  it('should treat an escaped interpolation in a template literal as constant text', () => {
    expect(parseModuleSpecifier('`./\\${name}.js`', { isDynamicImport: true }).isConstant).toBe(true);
  });

  it('should throw when a static import specifier is not a constant string literal', () => {
    expect(() => parseModuleSpecifier('moduleName', { isDynamicImport: false })).toThrow(InstrumentBundlerError);
  });
});

describe('parseImports', () => {
  it('should parse the default, named and namespace bindings of static imports', () => {
    const imports = [
      ...parseImports(`import React, { useState, useEffect as effect } from 'react';\nimport * as path from 'path';`)
    ];
    expect(imports.map(({ importClause }) => importClause)).toEqual([
      {
        default: 'React',
        named: [
          { binding: 'useState', specifier: 'useState' },
          { binding: 'effect', specifier: 'useEffect' }
        ],
        namespace: undefined
      },
      { default: undefined, named: [], namespace: 'path' }
    ]);
  });

  it('should include the quotes of a static specifier in its character range', () => {
    const source = `import { App } from './App.tsx';`;
    const [result] = [...parseImports(source)];
    expect(source.slice(result!.moduleSpecifier.startIndex, result!.moduleSpecifier.endIndex)).toBe(`'./App.tsx'`);
  });

  it('should give a side-effect import an empty import clause', () => {
    const [result] = [...parseImports(`import './styles.css';`)];
    expect(result!.importClause).toEqual({ default: undefined, named: [], namespace: undefined });
  });

  it('should extend the range of a dynamic import past its closing parenthesis and omit its import clause', () => {
    const source = `const mod = await import('./mod.js');`;
    const [result] = [...parseImports(source)];
    expect(result).toMatchObject({ importClause: undefined, isDynamicImport: true });
    expect(source.slice(result!.startIndex, result!.endIndex)).toBe(`import('./mod.js')`);
  });

  it('should skip import.meta, since it does not import a module', () => {
    expect([...parseImports(`const url = import.meta.url;`)]).toEqual([]);
  });
});
