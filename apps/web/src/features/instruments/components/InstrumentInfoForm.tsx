/* eslint-disable perfectionist/sort-object-types */
/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { bilingualArrayFieldSchema, createBilingualArrayField, createBilingualFieldGroup } from '../utils';

import type { SelectedLanguage } from '../types';

export type InstrumentInfoFormData = {
  descriptionEnglish?: string;
  descriptionFrench?: string;
  language: SelectedLanguage;
  name: string;
  tags: {
    [K in SelectedLanguage]?: string;
  }[];
  version: number;
};

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
        createBilingualFieldGroup({
          baseFieldName: 'description',
          defaultLanguage,
          label: t('create.info.description')
        }),
        {
          title: t('create.info.tags'),
          fields: {
            tags: createBilingualArrayField({
              defaultLanguage,
              label: t('create.info.tag')
            })
          }
        }
      ]}
      validationSchema={z.object({
        descriptionEnglish: z.string().optional(),
        descriptionFrench: z.string().optional(),
        name: z.string(),
        language: z.enum(['english', 'french', 'bilingual']),
        version: z.number(),
        tags: bilingualArrayFieldSchema
      })}
      onSubmit={onSubmit}
    />
  );
};
