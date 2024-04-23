import { P, match } from 'ts-pattern';

export type FileLanguage = 'css' | 'javascript' | 'typescript';

export type FileExtension = '.css' | '.js' | '.jsx' | '.ts' | '.tsx';

export function extractFileExtension(filename: string) {
  return (filename.match(/\.(css|js|ts|tsx|jsx)$/i)?.[0] ?? null) as FileExtension | null;
}

export function inferFileLanguage(filename: string): FileLanguage | null {
  return match(extractFileExtension(filename))
    .with('.css', () => 'css' as const)
    .with(P.union('.js', '.jsx'), () => 'javascript' as const)
    .with(P.union('.ts', '.tsx'), () => 'typescript' as const)
    .with(null, () => null)
    .exhaustive();
}
