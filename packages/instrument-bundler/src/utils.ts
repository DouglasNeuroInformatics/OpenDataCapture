import { InstrumentBundlerMiscInternalError } from './error.js';

import type { BundlerInputFileExtension } from './types.js';
import type { Loader } from './vendor/esbuild.js';

export function extractInputFileExtension(filename: string) {
  return (filename.match(/\.(css|js|ts|tsx|jsx)$/i)?.[0] ?? null) as BundlerInputFileExtension | null;
}

export function inferLoader(filename: string): Loader {
  const extension = extractInputFileExtension(filename);
  switch (extension) {
    case '.css':
      return 'css';
    case '.js':
      return 'js';
    case '.jsx':
      return 'js';
    case '.ts':
      return 'ts';
    case '.tsx':
      return 'tsx';
    default:
      throw new InstrumentBundlerMiscInternalError(
        `Cannot infer loader due to unexpected extension for filename: ${filename}`
      );
  }
}
