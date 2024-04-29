import { P, match } from 'ts-pattern';

import { InstrumentBundlerMiscInternalError } from './error.js';

import type { BundlerInputFileExtension } from './types.js';
import type { Loader } from './vendor/esbuild.js';

export function extractInputFileExtension(filename: string) {
  const ext = filename.match(/\.(css|jpeg|jpg|js|jsx|png|svg|ts|tsx|webp)$/i)?.[0];
  return (ext ?? null) as BundlerInputFileExtension | null;
}

export function inferLoader(filename: string): Loader {
  return match(extractInputFileExtension(filename))
    .with('.css', () => 'css' as const)
    .with('.js', () => 'js' as const)
    .with('.jsx', () => 'jsx' as const)
    .with('.ts', () => 'ts' as const)
    .with('.tsx', () => 'tsx' as const)
    .with(P.union('.jpeg', '.jpg', '.png', '.svg', '.webp'), () => 'dataurl' as const)
    .with(null, () => {
      throw new InstrumentBundlerMiscInternalError(
        `Cannot infer loader due to unexpected extension for filename: ${filename}`
      );
    })
    .exhaustive();
}
