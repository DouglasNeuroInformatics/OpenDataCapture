import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = resolve(import.meta.dirname, '../../../..');

/**
 * Every frontend that can render Spanish. `apps/web` is the only one of the three with a vitest
 * project, so the contract is asserted for all of them from here rather than not at all.
 */
const FRONTEND_ROOTS = ['apps/web/src', 'packages/react-core/src', 'apps/gateway/src'];

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      return entry === 'node_modules' ? [] : sourceFiles(path);
    }
    return /\.tsx?$/.test(path) && !/\.(stories|test)\.tsx?$/.test(path) ? [path] : [];
  });

/**
 * The end of the `{…}` starting at `from`. Quotes, template literals and comments are tracked
 * because a brace or quote inside one of them is text, not structure.
 */
const endOfObject = (src: string, from: number): number => {
  const enclosing: string[] = [];
  let depth = 0;
  let i = from;
  while (i < src.length) {
    const char = src[i]!;
    const inside = enclosing.at(-1);
    if (inside === "'" || inside === '"' || inside === '`') {
      if (char === '\\') i++;
      else if (char === inside) enclosing.pop();
      else if (inside === '`' && char === '$' && src[i + 1] === '{') {
        enclosing.push('${');
        i++;
      }
    } else if (inside === '//') {
      if (char === '\n') enclosing.pop();
    } else if (inside === '/*') {
      if (char === '*' && src[i + 1] === '/') {
        enclosing.pop();
        i++;
      }
    } else if (char === "'" || char === '"' || char === '`') {
      enclosing.push(char);
    } else if (char === '/' && (src[i + 1] === '/' || src[i + 1] === '*')) {
      enclosing.push(`/${src[i + 1]}`);
      i++;
    } else if (char === '{') {
      depth++;
    } else if (char === '}') {
      if (inside === '${') enclosing.pop();
      else if (--depth === 0) return i + 1;
    }
    i++;
  }
  return -1;
};

const untranslatedCalls = (src: string): string[] => {
  const calls: string[] = [];
  for (const match of src.matchAll(/\bt\s*\(\s*\{/g)) {
    const start = match.index + match[0].length - 1;
    const end = endOfObject(src, start);
    if (end === -1) continue;
    const object = src.slice(start, end);
    if (/(^|[{,\s])en\s*:/.test(object) && !/(^|[{,\s])es\s*:/.test(object)) {
      calls.push(object.replace(/\s+/g, ' '));
    }
  }
  return calls;
};

describe('Spanish coverage', () => {
  it('should give every inline translation a Spanish entry, so selecting Español never falls back to English', () => {
    const untranslated = FRONTEND_ROOTS.flatMap((root) =>
      sourceFiles(join(REPO_ROOT, root)).flatMap((file) =>
        untranslatedCalls(readFileSync(file, 'utf8')).map(
          (call) => `${relative(REPO_ROOT, file)} — ${call.slice(0, 120)}`
        )
      )
    );
    expect(untranslated).toStrictEqual([]);
  });

  it('should detect a translation object that names every language but Spanish', () => {
    expect(untranslatedCalls(`t({ en: 'Mail', fr: 'Courriel' })`)).toHaveLength(1);
    expect(untranslatedCalls(`t({ en: 'Mail', es: 'Correo', fr: 'Courriel' })`)).toHaveLength(0);
  });

  it('should read a brace inside a string as text, so the object it appears in still terminates', () => {
    expect(untranslatedCalls(`t({ en: 'a } b', fr: 'c } d' })`)).toHaveLength(1);
    expect(untranslatedCalls(`t({ en: \`x \${y} }\`, es: 'z', fr: 'w' })`)).toHaveLength(0);
  });
});
