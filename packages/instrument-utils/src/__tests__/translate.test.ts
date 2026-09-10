import type {
  AnyInstrument,
  AnyMultilingualFileInstrument,
  AnyMultilingualFormInstrument,
  AnyMultilingualInteractiveInstrument,
  AnyUnilingualFormInstrument,
  AnyUnilingualInteractiveInstrument,
  SeriesInstrument
} from '@opendatacapture/runtime-core';
import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';
import { describe, expect, it } from 'vitest';

import { translateInstrument, translateInstrumentInfo } from '../translate.js';

// A bilingual form exercising every branch of translateFormContent/translateFormFields/
// translateStaticField/translateScalarField/translateRecordArrayFieldset: the array content form,
// a passthrough block, a group with and without a title/description, a top-level dynamic field
// (both a null and a non-null render), a record-array field whose fieldset itself holds a dynamic
// field, and a number-record field.
const bilingualForm = {
  clientDetails: {
    instructions: { en: 'Client instructions', fr: 'Instructions client' },
    title: { en: 'Client Title', fr: 'Titre client' }
  },
  content: [
    { kind: 'block', render: () => null },
    {
      description: { en: 'Group description', fr: 'Description du groupe' },
      fields: {
        agree: {
          kind: 'boolean',
          label: { en: 'Agree?', fr: "D'accord?" },
          variant: 'checkbox'
        },
        birthDate: {
          kind: 'date',
          label: { en: 'Birth Date', fr: 'Date de naissance' },
          variant: 'input'
        },
        color: {
          kind: 'string',
          label: { en: 'Color', fr: 'Couleur' },
          options: { en: { blue: 'Blue', red: 'Red' }, fr: { blue: 'Bleu', red: 'Rouge' } },
          variant: 'select'
        },
        comment: {
          deps: [],
          kind: 'dynamic',
          render: (data: { agree?: boolean }) =>
            data?.agree ? { kind: 'string', label: { en: 'Comment', fr: 'Commentaire' }, variant: 'textarea' } : null
        },
        exposures: {
          fieldset: {
            reaction: {
              deps: [],
              kind: 'dynamic',
              render: (data: { severity?: number }) =>
                data?.severity ? { kind: 'string', label: { en: 'Reaction', fr: 'Réaction' }, variant: 'input' } : null
            },
            severity: {
              kind: 'number',
              label: { en: 'Severity', fr: 'Sévérité' },
              variant: 'slider'
            }
          },
          kind: 'record-array',
          label: { en: 'Exposures', fr: 'Expositions' },
          variant: 'list'
        },
        satisfaction: {
          items: {
            overall: { label: { en: 'Overall', fr: 'Global' } }
          },
          kind: 'number-record',
          label: { en: 'Satisfaction', fr: 'Satisfaction' },
          options: { en: { 1: 'Low', 5: 'High' }, fr: { 1: 'Faible', 5: 'Élevé' } },
          variant: 'likert'
        },
        satisfiedWith: {
          kind: 'boolean',
          label: { en: 'Satisfied With', fr: 'Satisfait de' },
          options: { en: { false: 'No', true: 'Yes' }, fr: { false: 'Non', true: 'Oui' } },
          variant: 'radio'
        }
      },
      title: { en: 'Group Title', fr: 'Titre du groupe' }
    },
    {
      fields: { agree: { kind: 'boolean', label: { en: 'Agree Again?', fr: "Encore d'accord?" }, variant: 'checkbox' } }
    }
  ],
  details: {
    description: { en: 'Description', fr: 'Description' },
    instructions: { en: ['Step 1'], fr: ['Étape 1'] },
    license: 'Apache-2.0',
    title: { en: 'Bilingual Form', fr: 'Formulaire bilingue' }
  },
  internal: { edition: 1, name: 'BILINGUAL_FORM_STUB' },
  kind: 'FORM',
  language: ['en', 'fr'],
  measures: {
    computedScore: { kind: 'computed', label: { en: 'Score', fr: 'Score' }, value: () => 1 },
    constScore: { kind: 'const', ref: 'constScore' }
  },
  tags: { en: ['Example'], fr: ['Exemple'] }
} as unknown as AnyMultilingualFormInstrument;

describe('translateInstrument — FORM', () => {
  it('should translate a bilingual form to the preferred language when it is supported', () => {
    const translated = translateInstrument(bilingualForm, 'fr');
    expect(translated.language).toBe('fr');
    expect(translated.details.title).toBe('Formulaire bilingue');
    expect(translated.clientDetails?.title).toBe('Titre client');
    expect(translated.tags).toEqual(['Exemple']);
  });

  it('should translate the array content, passing blocks through and translating groups', () => {
    const translated = translateInstrument(bilingualForm, 'en');
    const content = translated.content as any[];
    expect(content[0]).toEqual({ kind: 'block', render: expect.any(Function) });
    expect(content[1].title).toBe('Group Title');
    expect(content[1].description).toBe('Group description');
    expect(content[2].title).toBeUndefined();
  });

  it('should translate a static scalar field for each ts-pattern arm', () => {
    const translated = translateInstrument(bilingualForm, 'en');
    const fields = (translated.content as any[])[1].fields;
    expect(fields.agree).toMatchObject({ kind: 'boolean', label: 'Agree?', variant: 'checkbox' });
    expect(fields.birthDate).toMatchObject({ kind: 'date', label: 'Birth Date' });
    expect(fields.satisfiedWith).toMatchObject({
      kind: 'boolean',
      label: 'Satisfied With',
      options: { false: 'No', true: 'Yes' }
    });
    expect(fields.color).toMatchObject({ kind: 'string', label: 'Color', options: { blue: 'Blue', red: 'Red' } });
  });

  it("should translate a top-level dynamic field's render result, or pass through its null", () => {
    const translated = translateInstrument(bilingualForm, 'en');
    const fields = (translated.content as any[])[1].fields;
    expect(fields.comment.render({ agree: false })).toBeNull();
    expect(fields.comment.render({ agree: true })).toMatchObject({ kind: 'string', label: 'Comment' });
  });

  it("should translate a record-array field's fieldset, including a dynamic entry within it", () => {
    const translated = translateInstrument(bilingualForm, 'en');
    const fields = (translated.content as any[])[1].fields;
    expect(fields.exposures.fieldset.severity).toMatchObject({ kind: 'number', label: 'Severity' });
    expect(fields.exposures.fieldset.reaction.render({ severity: 0 })).toBeNull();
    expect(fields.exposures.fieldset.reaction.render({ severity: 3 })).toMatchObject({
      kind: 'string',
      label: 'Reaction'
    });
  });

  it("should translate a number-record field's items and options", () => {
    const translated = translateInstrument(bilingualForm, 'en');
    const fields = (translated.content as any[])[1].fields;
    expect(fields.satisfaction.items.overall).toEqual({ description: undefined, label: 'Overall' });
    expect(fields.satisfaction.options).toEqual({ 1: 'Low', 5: 'High' });
  });

  it('should translate computed and non-computed measures', () => {
    const translated = translateInstrument(bilingualForm, 'en') as AnyUnilingualFormInstrument;
    expect(translated.measures).toEqual({
      computedScore: { kind: 'computed', label: 'Score', value: expect.any(Function) },
      constScore: { kind: 'const', label: undefined, ref: 'constScore' }
    });
  });

  it('should return null measures unchanged', () => {
    const instrument = { ...bilingualForm, measures: null } as unknown as AnyMultilingualFormInstrument;
    const translated = translateInstrument(instrument, 'en') as AnyUnilingualFormInstrument;
    expect(translated.measures).toBeNull();
  });

  it('should leave clientDetails undefined when the instrument declares none', () => {
    const instrument = { ...bilingualForm, clientDetails: undefined } as unknown as AnyMultilingualFormInstrument;
    expect(translateInstrument(instrument, 'en').clientDetails).toBeUndefined();
  });

  it('should translate content given as the non-array object form, skipping a falsy field', () => {
    const instrument = {
      ...bilingualForm,
      content: {
        agree: { kind: 'boolean', label: { en: 'Agree?', fr: "D'accord?" }, variant: 'checkbox' },
        ghost: undefined
      }
    } as unknown as AnyMultilingualFormInstrument;
    const translated = translateInstrument(instrument, 'en');
    expect(translated.content).toEqual({
      agree: { description: undefined, kind: 'boolean', label: 'Agree?', variant: 'checkbox' }
    });
  });
});

const bilingualInteractive = {
  clientDetails: undefined,
  content: { render: () => undefined },
  details: {
    description: { en: 'Description', fr: 'Description' },
    license: 'Apache-2.0',
    title: { en: 'Interactive', fr: 'Interactif' }
  },
  internal: { edition: 1, name: 'BILINGUAL_INTERACTIVE_STUB' },
  kind: 'INTERACTIVE',
  language: ['en', 'fr'],
  measures: { message: { kind: 'const', ref: 'message' } },
  tags: { en: ['Example'], fr: ['Exemple'] }
} as unknown as AnyMultilingualInteractiveInstrument;

const bilingualFile = {
  clientDetails: undefined,
  content: {
    fileGroups: [
      { basename: 'file', count: { max: 1, min: 1 }, id: 'file', label: { en: 'File', fr: 'Fichier' }, type: null }
    ]
  },
  details: {
    description: { en: 'Description', fr: 'Description' },
    license: 'Apache-2.0',
    title: { en: 'File', fr: 'Fichier' }
  },
  internal: { edition: 1, name: 'BILINGUAL_FILE_STUB' },
  kind: 'FILE',
  language: ['en', 'fr'],
  measures: null,
  tags: { en: ['Example'], fr: ['Exemple'] }
} as unknown as AnyMultilingualFileInstrument;

const bilingualSeries = {
  clientDetails: undefined,
  content: [{ edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' }],
  details: {
    description: { en: 'Description', fr: 'Description' },
    license: 'UNLICENSED',
    title: { en: 'Series', fr: 'Série' }
  },
  kind: 'SERIES',
  language: ['en', 'fr'],
  tags: { en: ['Example'], fr: ['Exemple'] }
} as unknown as SeriesInstrument<('en' | 'fr')[]>;

describe('translateInstrument — INTERACTIVE, FILE and SERIES', () => {
  it('should translate an interactive instrument', () => {
    const translated = translateInstrument(bilingualInteractive, 'fr') as AnyUnilingualInteractiveInstrument;
    expect(translated.details.title).toBe('Interactif');
    expect(translated.measures).toEqual({ message: { kind: 'const', label: undefined, ref: 'message' } });
  });

  it("should translate a file instrument's file groups", () => {
    const translated = translateInstrument(bilingualFile, 'fr');
    expect((translated.content as any).fileGroups[0].label).toBe('Fichier');
  });

  it('should translate a series instrument', () => {
    const translated = translateInstrument(bilingualSeries, 'fr');
    expect(translated.details.title).toBe('Série');
  });
});

describe('translateInstrument — unilingual passthrough and errors', () => {
  it('should return a unilingual instrument unchanged', () => {
    const unilingual = { ...bilingualFile, language: 'en' } as unknown as AnyInstrument;
    expect(translateInstrument(unilingual, 'en')).toBe(unilingual);
  });

  it('should throw when the instrument language is neither a string nor an array', () => {
    const invalid = { ...bilingualFile, language: null } as unknown as AnyInstrument;
    expect(() => translateInstrument(invalid, 'en')).toThrow(/Unexpected value for property 'language'/);
  });

  it('should throw when a multilingual instrument has an unrecognized kind', () => {
    const invalid = { ...bilingualFile, kind: 'UNKNOWN' } as unknown as AnyInstrument;
    expect(() => translateInstrument(invalid, 'en')).toThrow(/Unexpected instrument kind/);
  });

  it('should fall back to the first authored language when the preferred language is not one instruments can be authored in', () => {
    expect(translateInstrument(bilingualFile, 'es').language).toBe('en');
  });

  it('should fall back to the first authored language when the preferred language is not among those the instrument supports', () => {
    const frenchOnly = { ...bilingualFile, language: ['fr'] } as unknown as AnyInstrument;
    expect(translateInstrument(frenchOnly, 'en').language).toBe('fr');
  });
});

describe('translateInstrumentInfo', () => {
  const unilingualInfo = { ...bilingualFile, language: 'en' } as unknown as InstrumentInfo;
  const multilingualInfo = { ...bilingualFile } as unknown as InstrumentInfo;

  it('should return a unilingual instrument info with itself as the sole supported language', () => {
    expect(translateInstrumentInfo(unilingualInfo, 'en')).toMatchObject({ language: 'en', supportedLanguages: ['en'] });
  });

  it('should translate a multilingual instrument info to the preferred language', () => {
    const translated = translateInstrumentInfo(multilingualInfo, 'fr');
    expect(translated.language).toBe('fr');
    expect(translated.supportedLanguages).toEqual(['en', 'fr']);
    expect(translated.details.title).toBe('Fichier');
    expect(translated.tags).toEqual(['Exemple']);
  });

  it('should throw when the info language is neither a string nor an array', () => {
    const invalid = { ...bilingualFile, language: null } as unknown as InstrumentInfo;
    expect(() => translateInstrumentInfo(invalid, 'en')).toThrow(/Unexpected value for property 'language'/);
  });
});
