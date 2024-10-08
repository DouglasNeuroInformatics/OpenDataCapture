import { InstrumentBundlerError } from './error.js';

import type { BundlerInput } from './schemas.js';

function resolveIndexInput<T extends BundlerInput>(inputs: T[]): T {
  if (inputs.length === 0) {
    throw new InstrumentBundlerError('Failed to resolve index file from empty array');
  }
  const extensions = ['.tsx', '.jsx', '.ts', '.js'];
  for (const extension of extensions) {
    const match = inputs.find((file) => file.name === `index` + extension);
    if (match) {
      return match;
    }
  }
  throw new InstrumentBundlerError(
    `Failed to resolve index file from input filenames: ${inputs.map((file) => `'${file.name}'`).join(', ')}`
  );
}

function extractFilenameFromPath(path: string): string {
  const parts = path.split('/');
  if (parts[0] === '.' && parts.length === 2) {
    return parts[1]!;
  }
  throw new InstrumentBundlerError(`Invalid path '${path}': expected relative path to file in same directory`);
}

function resolveInput<T extends BundlerInput>(path: string, inputs: T[]): null | T {
  const filename = extractFilenameFromPath(path);
  return inputs.find((input) => input.name === filename) ?? null;
}

export { resolveIndexInput, resolveInput };
