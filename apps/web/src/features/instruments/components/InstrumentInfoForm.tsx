/* eslint-disable perfectionist/sort-object-types */
/* eslint-disable perfectionist/sort-objects */

import type { ArrayFormField } from '@douglasneuroinformatics/form-types';
import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { bilingualFieldSchema, createBilingualField } from '../utils';

import type { InstrumentInfoFormData } from '../types';

export type InstrumentInfoFormProps = {
  onSubmit: (data: InstrumentInfoFormData) => void;
};

export const InstrumentInfoForm = ({ onSubmit }: InstrumentInfoFormProps) => {
  const { i18n, t } = useTranslation(['instruments', 'common']);
  const defaultLanguage = i18n.resolvedLanguage === 'en' ? 'english' : 'french';
  return (
    <Form<InstrumentInfoFormData>
      content={[
        {
          title: t('create.info.basicMetadata'),
          fields: {
            name: {
              kind: 'text',
              label: t('instruments:create.info.name'),
              variant: 'short'
            },
            language: {
              kind: 'options',
              label: t('create.info.language'),
              options: {
                english: t('common:languages.english'),
                french: t('common:languages.french'),
                bilingual: t('common:bilingual')
              }
            },
            version: {
              kind: 'numeric',
              label: 'Version',
              max: 10,
              min: 0,
              variant: 'default'
            }
          }
        },
        {
          title: t('create.info.details'),
          fields: {
            description: createBilingualField({
              defaultLanguage,
              label: t('create.info.description')
            })
          }
        },
        {
          title: t('create.info.tags'),
          fields: {
            tags: {
              deps: ['language'],
              kind: 'dynamic',
              render: (data) => {
                const field: ArrayFormField = {
                  kind: 'array',
                  label: t('create.info.tag'),
                  fieldset: {}
                };
                const fieldset = {
                  english: {
                    kind: 'text',
                    label: t('common:languages.english'),
                    variant: 'short'
                  },
                  french: {
                    kind: 'text',
                    label: t('common:languages.french'),
                    variant: 'short'
                  }
                } as const;
                if (!data?.language) {
                  field.fieldset[defaultLanguage] = fieldset[defaultLanguage];
                }
                if (data?.language === 'english' || data?.language === 'bilingual') {
                  field.fieldset.english = fieldset.english;
                }
                if (data?.language === 'french' || data?.language === 'bilingual') {
                  field.fieldset.french = fieldset.french;
                }
                return field;
              }
            }
          }
        }
      ]}
      validationSchema={z.object({
        description: bilingualFieldSchema,
        name: z.string(),
        language: z.enum(['english', 'french', 'bilingual']),
        version: z.number(),
        tags: bilingualFieldSchema
      })}
      onSubmit={onSubmit}
    />
  );
};
