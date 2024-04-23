import { extractInputFileExtension } from '@opendatacapture/instrument-bundler';
import { P, match } from 'ts-pattern';

export type FileLanguage = 'css' | 'javascript' | 'typescript';

export function inferFileLanguage(filename: string): FileLanguage | null {
  return match(extractInputFileExtension(filename))
    .with('.css', () => 'css' as const)
    .with(P.union('.js', '.jsx'), () => 'javascript' as const)
    .with(P.union('.ts', '.tsx'), () => 'typescript' as const)
    .with(null, () => null)
    .exhaustive();
}
