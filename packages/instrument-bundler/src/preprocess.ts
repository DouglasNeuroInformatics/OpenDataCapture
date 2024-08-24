import { InstrumentBundlerError } from './error.js';

import type { BundlerInput } from './schemas.js';

/**
 * Checks that the provided inputs contain at least one element, and that no input contains
 * illegal characters in it's name (i.e., it is a shallow, relative path)
 *
 * @param inputs - the inputs to be used to generate a bundle
 */
function validateInputs(inputs: BundlerInput[]) {
  if (inputs.length === 0) {
    throw new InstrumentBundlerError('Received empty array for inputs');
  }
  for (const input of inputs) {
    if (input.name.includes('/')) {
      throw new InstrumentBundlerError(
        `Illegal character '/' in input name '${input.name}': expected shallow relative path (e.g., './foo.js')`
      );
    }
  }
}

export function preprocess(inputs: BundlerInput[]) {
  validateInputs(inputs);
}
