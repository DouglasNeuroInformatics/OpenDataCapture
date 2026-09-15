import * as fs from 'node:fs';
import * as path from 'node:path';

const suitesDir = path.resolve(import.meta.dirname, 'suites');

// Suites run in filename order against one shared app, so a numeric prefix is how a suite that
// depends on state an earlier one wrote declares that it must run after it.
for (const filename of (await fs.promises.readdir(suitesDir)).sort()) {
  const { default: suite } = (await import(path.join(suitesDir, filename))) as { default: () => void };
  suite();
}
