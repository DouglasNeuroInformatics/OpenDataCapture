import { useInterpretedInstrument } from './useInterpretedInstrument';
import { useTranslatedInstrument } from './useTranslatedInstrument';

/**
 * Interpret a given bundle, returning the instance translated to the user's language
 * if possible, falling back to alternative languages if necessary
 *
 * @param bundle - the JavaScript code to be interpreted directly in the browser
 * @returns The unilingual instrument generated from the code
 */
export function useResolvedInstrument(bundle: string) {
  const instrument = useInterpretedInstrument(bundle);
  return useTranslatedInstrument(instrument);
}
