import { useMediaQuery } from '@douglasneuroinformatics/libui/hooks';

export function useIsDesktop() {
  return useMediaQuery('(min-width: 768px)');
}
