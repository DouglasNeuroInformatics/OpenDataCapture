import { Language } from '../enums';

/** An object providing metadata for a specific instrument */
export interface InstrumentDetails {
  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: string;

  /** The language in which the fields of the instrument are written */
  language: Language;

  /** Brief instructions for how the subject should complete the instrument */
  instructions: string;

  /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
  estimatedDuration: number;

  /** An integer or float representing the version of the instrument, as specified by the creator of the instrument. If unknown, then assume version 1.0 */
  version: number;

  /** A series of one or more keywords that define the instrument */
  tags: string[];
}
