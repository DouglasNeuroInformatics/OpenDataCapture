export type InstrumentKind = 'form';

/** Defines the basic properties of all instruments */
export type BaseInstrument = {
  /** The discriminator key for the type of instrument */
  kind: InstrumentKind;

  /** The English name of the instrument which is used to associate alternative versions of the same instrument */
  name: string;

  /** A list of tags that users can use to filter instruments */
  tags: string[];

  /** The version of the instrument */
  version: number;

  /** The content in the instrument to be rendered to the user */
  content: unknown;
};
