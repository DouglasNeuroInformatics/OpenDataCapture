import { deepFreeze } from '@douglasneuroinformatics/libjs';
import { z } from 'zod';

import type { Language } from '../../core/core.index.js';
import type { FormInstrument } from '../instrument.form.js';

type FormInstrumentStubData = {
  favoriteNumber: number;
  reasonFavoriteNumberIsNegative?: string;
};

export const UNILINGUAL_FORM_INSTRUMENT = deepFreeze({
  content: {
    favoriteNumber: {
      kind: 'number',
      label: 'Favorite Number',
      variant: 'input'
    },
    reasonFavoriteNumberIsNegative: {
      deps: ['favoriteNumber'],
      kind: 'dynamic',
      render(data) {
        if (!data?.favoriteNumber || data.favoriteNumber >= 0) {
          return null;
        }
        return {
          kind: 'string',
          label: 'Why is Your Favorite Number Negative?',
          variant: 'textarea'
        };
      }
    }
  },
  details: {
    description: 'This is a unilingual form instrument',
    estimatedDuration: 1,
    instructions: ['Please complete all questions'],
    license: 'AGPL-3.0',
    title: 'Unilingual Form'
  },
  kind: 'FORM',
  language: 'en',
  name: 'unilingual-form',
  tags: ['Example'],
  validationSchema: z.object({
    favoriteNumber: z.number(),
    reasonFavoriteNumberIsNegative: z.string().optional()
  }),
  version: 1.0
} satisfies FormInstrument<FormInstrumentStubData, Language>) as any as FormInstrument<
  FormInstrumentStubData,
  Language
>;

export const BILINGUAL_FORM_INSTRUMENT = deepFreeze({
  content: {
    favoriteNumber: {
      kind: 'number',
      label: {
        en: 'Favorite Number',
        fr: 'Numéro préféré'
      },
      variant: 'input'
    },
    reasonFavoriteNumberIsNegative: {
      deps: ['favoriteNumber'],
      kind: 'dynamic',
      render(data) {
        if (!data?.favoriteNumber || data.favoriteNumber >= 0) {
          return null;
        }
        return {
          kind: 'string',
          label: {
            en: 'Why is Your Favorite Number Negative?',
            fr: 'Pourquoi votre nombre préféré est-il négatif ?'
          },
          variant: 'textarea'
        };
      }
    }
  },
  details: {
    description: {
      en: 'This is a unilingual form instrument',
      fr: "Il s'agit d'un instrument unilingue"
    },
    estimatedDuration: 1,
    instructions: {
      en: ['Please complete all questions'],
      fr: ['Veuillez répondre à toutes les questions']
    },
    license: 'AGPL-3.0',
    title: {
      en: 'Unilingual Form',
      fr: 'Formulaire unilingue'
    }
  },
  kind: 'FORM',
  language: ['en', 'fr'],
  name: 'unilingual-form',
  tags: {
    en: ['Example'],
    fr: ['Exemple']
  },
  validationSchema: z.object({
    favoriteNumber: z.number(),
    reasonFavoriteNumberIsNegative: z.string().optional()
  }),
  version: 1.0
} satisfies FormInstrument<FormInstrumentStubData, Language[]>) as any as FormInstrument<
  FormInstrumentStubData,
  Language[]
>;
