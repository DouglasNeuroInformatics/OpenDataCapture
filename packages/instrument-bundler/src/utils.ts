import { match, P } from 'ts-pattern';

import { InstrumentBundlerError } from './error.js';

import type { BundlerInputFileExtension } from './types.js';
import type { Loader } from './vendor/esbuild.js';

export function extractInputFileExtension(filename: string) {
  const ext = /\.(css|html|jpeg|jpg|js|jsx|json|mp4|png|svg|ts|tsx|webp)$/i.exec(filename)?.[0];
  return (ext ?? null) as BundlerInputFileExtension | null;
}

export function inferLoader(filename: string): Loader {
  return match(extractInputFileExtension(filename))
    .with('.css', () => 'css' as const)
    .with('.html', () => 'text' as const)
    .with('.js', () => 'js' as const)
    .with('.jsx', () => 'jsx' as const)
    .with('.json', () => 'json' as const)
    .with('.ts', () => 'ts' as const)
    .with('.tsx', () => 'tsx' as const)
    .with(P.union('.jpeg', '.jpg', '.png', '.svg', '.webp', '.mp4'), () => 'dataurl' as const)
    .with(null, () => {
      throw new InstrumentBundlerError(`Cannot infer loader due to unexpected extension for filename: ${filename}`);
    })
    .exhaustive();
}

export function isHttpImport(path: string) {
  return path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://');
}
