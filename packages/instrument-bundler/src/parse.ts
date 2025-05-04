/* eslint-disable import/exports-last */

/**
 * Adapted from https://github.com/TomerAberbach/parse-imports
 * Rewrote in TypeScript and to be usable in the browser (removed/changed all Node.js-reliant code)
 *
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { parse as _parse, ImportType, init } from 'es-module-lexer';
import { removeSlashes } from 'slashes';

import { InstrumentBundlerError } from './error.js';

await init;

/**
 * A type representing what kind of module a specifier refers to.
 *
 * - 'unknown' if the module specifier is not a simple constant string literal
 * - 'invalid' if the module specifier is the empty string
 * - 'absolute' if the module specifier is an absolute file path
 * - 'relative' if the module specifier is a relative file path
 * - 'package' otherwise
 */
export type ModuleSpecifierType = 'absolute' | 'invalid' | 'package' | 'relative' | 'unknown';

/**
 * A type representing what is being imported from the module.
 *
 * Undefined if `isDynamicImport` is true.
 */
export type ImportClause = {
  /**
   * The default import identifier or undefined if the import statement does
   * not have a default import.
   */
  default?: string;

  /**
   * An array of objects representing the named imports of the import
   * statement. It is empty if the import statement does not have any named
   * imports. Each object in the array has a specifier field set to the
   * imported identifier and a binding field set to the identifier for
   * accessing the imported value.
   * For example, `import { a, x as y } from 'something'` would have the
   * following array:
   * ```
   * [{ specifier: 'a', binding: 'a' }, { specifier: 'x', binding: 'y' }]
   * ```
   */
  named: { binding: string; specifier: string }[];

  /**
   * The namespace import identifier or undefined if the import statement does
   * not have a namespace import.
   */
  namespace?: string;
};

/**
 * A type representing an import in JavaScript code.
 *
 * `code.substring(startIndex, endIndex)` returns the full import statement or
 * expression.
 */
export type Import = {
  /** The end index of the import in the JavaScript (exclusive). */
  endIndex: number;

  importClause?: ImportClause;

  /** Whether the import is a dynamic import (e.g. `import('module')`). */
  isDynamicImport: boolean;

  /**
   * A type representing the code specifiying the module being imported.
   *
   * `code.substring(moduleSpecifier.startIndex, moduleSpecifier.endIndex)`
   * returns the module specifier including quotes.
   */
  moduleSpecifier: {
    /**
     * The module specifier as it was written in the code. For non-constant
     * dynamic imports it could be a complex expression.
     */
    code: string;

    /** The end index of the specifier in the JavaScript (exclusive). */
    endIndex: number;

    /**
     * True when the import is not a dynamic import (`isDynamicImport` is
     * false), or when the import is a dynamic import where the specifier is a
     * simple string literal (e.g. import('fs'), import("fs"), import(`fs`)).
     */
    isConstant: boolean;

    /** Set if the `resolveFrom` option is set and `value` is not undefined. */
    resolved?: string;

    /** The start index of the specifier in the JavaScript (inclusive). */
    startIndex: number;

    /**
     * What kind of module the specifier refers to.
     *
     * 'unknown' when `moduleSpecifier.isConstant` is false.
     */
    type: ModuleSpecifierType;

    /**
     * `code` without string literal quotes and unescaped if `isConstant` is
     * true. Otherwise, it is undefined.
     */
    value?: string;
  };

  /** The start index of the import in the JavaScript (inclusive). */
  startIndex: number;
};

const separatorRegex = /^(?:\s+|,)$/u;

function skipSeparators(imported: string, i: number) {
  while (i < imported.length && separatorRegex.test(imported[i]!)) {
    i++;
  }
  return i;
}

function skipNonSeparators(imported: string, i: number) {
  while (i < imported.length && !separatorRegex.test(imported[i]!)) {
    i++;
  }
  return i;
}

function parseDefaultImport(importClauseString: string, i: number) {
  const startIndex = i;
  i = skipNonSeparators(importClauseString, i);
  return { defaultImport: importClauseString.slice(startIndex, i), i };
}

function parseNamedImports(importClauseString: string, i: number) {
  const startIndex = ++i;

  while (i < importClauseString.length && importClauseString[i] !== `}`) {
    i++;
  }

  const namedImports = importClauseString
    .slice(startIndex, i++)
    .split(`,`)
    .map((namedImport) => {
      namedImport = namedImport.trim();
      if (namedImport.includes(` `)) {
        const components = namedImport.split(` `);
        return {
          binding: components.at(-1)!,
          specifier: components[0]!
        };
      }
      return { binding: namedImport, specifier: namedImport };
    })
    .filter(({ specifier }) => specifier.length > 0);

  return { i, namedImports };
}

function parseNamespaceImport(importClauseString: string, i: number) {
  i++;
  i = skipSeparators(importClauseString, i);
  i += `as`.length;
  i = skipSeparators(importClauseString, i);

  const startIndex = i;
  i = skipNonSeparators(importClauseString, i);

  return {
    i,
    namespaceImport: importClauseString.slice(startIndex, i)
  };
}

// Assumes import clause is syntactically valid
function parseImportClause(importClauseString: string) {
  let defaultImport;
  let namespaceImport;
  const namedImports = [];

  for (let i = 0; i < importClauseString.length; i++) {
    if (separatorRegex.test(importClauseString[i]!)) {
      continue;
    }

    if (importClauseString[i] === `{`) {
      let newNamedImports;
      ({ i, namedImports: newNamedImports } = parseNamedImports(importClauseString, i));
      namedImports.push(...newNamedImports);
    } else if (importClauseString[i] === `*`) {
      ({ i, namespaceImport } = parseNamespaceImport(importClauseString, i));
    } else {
      ({ defaultImport, i } = parseDefaultImport(importClauseString, i));
    }
  }

  return {
    default: defaultImport,
    named: namedImports,
    namespace: namespaceImport
  } as const;
}

function parseType(moduleSpecifier: string) {
  if (moduleSpecifier.length === 0) {
    return `invalid`;
  }
  if (moduleSpecifier.startsWith(`/`)) {
    return `absolute`;
  }
  if (moduleSpecifier.startsWith(`.`)) {
    return `relative`;
  }
  return `package`;
}

// Assumes the string is syntactically valid
function isConstantStringLiteral(stringLiteral: string) {
  const quote = [`'`, `"`, `\``].find(
    (quoteCandidate) => stringLiteral.startsWith(quoteCandidate) && stringLiteral.endsWith(quoteCandidate)
  );

  if (quote == null) {
    return false;
  }

  for (let i = 1; i < stringLiteral.length - 1; i++) {
    // Check for end of string literal before end of stringLiteral
    if (stringLiteral[i] === quote && stringLiteral[i - 1] !== `\\`) {
      return false;
    }

    // Check for interpolated value in template literal
    if (quote === `\`` && stringLiteral.slice(i, i + 2) === `\${` && stringLiteral[i - 1] !== `\\`) {
      return false;
    }
  }

  return true;
}

export function parseModuleSpecifier(moduleSpecifierString: string, { isDynamicImport }: { isDynamicImport: boolean }) {
  if (!(isDynamicImport || isConstantStringLiteral(moduleSpecifierString))) {
    throw new InstrumentBundlerError('Assertion failed');
  }

  const { isConstant, value } =
    !isDynamicImport || isConstantStringLiteral(moduleSpecifierString)
      ? {
          isConstant: true,
          value: removeSlashes(moduleSpecifierString.slice(1, -1))
        }
      : { isConstant: false, value: undefined };

  return {
    code: moduleSpecifierString,
    isConstant,
    resolved: undefined,
    type: isConstant ? parseType(value!) : `unknown`,
    value
  } as const;
}

export function parse(code: string) {
  const [imports, exports] = _parse(code);
  return {
    exports: exports.map(({ n }) => ({ exportName: n })),
    imports: imports.map(({ d, e, n, s, se, ss, t }) => ({
      dynamicImportStartIndex: d,
      importPath: n,
      importType: ImportType[t],
      moduleSpecifierEndIndexExclusive: e,
      moduleSpecifierStartIndex: s,
      statement: code.slice(ss, se),
      statementEndIndex: se,
      statementStartIndex: ss
    }))
  };
}

export function parseImports(code: string): Iterable<Import> {
  const { imports } = parse(code);

  return {
    *[Symbol.iterator]() {
      for (let {
        // eslint-disable-next-line prefer-const
        dynamicImportStartIndex,
        moduleSpecifierEndIndexExclusive,
        moduleSpecifierStartIndex,
        // eslint-disable-next-line prefer-const
        statementStartIndex
      } of imports) {
        const isImportMeta = dynamicImportStartIndex === -2;
        if (isImportMeta) {
          continue;
        }

        const isDynamicImport = dynamicImportStartIndex > -1;

        // Include string literal quotes in character range
        if (!isDynamicImport) {
          moduleSpecifierStartIndex--;
          moduleSpecifierEndIndexExclusive++;
        }

        const moduleSpecifierString = code.slice(moduleSpecifierStartIndex, moduleSpecifierEndIndexExclusive);
        const moduleSpecifier = {
          endIndex: moduleSpecifierEndIndexExclusive,
          startIndex: moduleSpecifierStartIndex,
          ...parseModuleSpecifier(moduleSpecifierString, {
            isDynamicImport
          })
        };

        let importClause;
        if (!isDynamicImport) {
          let importClauseString = code.slice(statementStartIndex + `import`.length, moduleSpecifierStartIndex).trim();
          if (importClauseString.endsWith(`from`)) {
            importClauseString = importClauseString.slice(0, Math.max(0, importClauseString.length - `from`.length));
          }
          importClause = parseImportClause(importClauseString);
        }

        yield {
          // Include the closing parenthesis for dynamic import
          endIndex: isDynamicImport ? moduleSpecifierEndIndexExclusive + 1 : moduleSpecifierEndIndexExclusive,
          importClause,
          isDynamicImport,
          moduleSpecifier,
          startIndex: statementStartIndex
        };
      }
    }
  };
}
