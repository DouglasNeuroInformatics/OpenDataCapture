/* eslint-disable perfectionist/sort-object-types */
/* eslint-disable perfectionist/sort-objects */

import { useContext } from 'react';

import { Form, StepperContext, useNotificationsStore } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { z } from 'zod';

import { createBilingualArrayField, createBilingualFieldGroup } from './utils';

import type { FormInstrumentInfoData } from './types';

const baseInfoFormDataSchema = z.object({
  estimatedDuration: z.number().int().positive(),
  name: z.string().min(1),
  version: z.number().positive()
});

const englishInfoFormDataSchema = baseInfoFormDataSchema.extend({
  descriptionEnglish: z.string(),
  instructionsEnglish: z.string(),
  language: z.literal('english'),
  tags: z.array(
    z.object({
      english: z.string()
    })
  ),
  titleEnglish: z.string()
});

const frenchInfoFormDataSchema = baseInfoFormDataSchema.extend({
  descriptionFrench: z.string(),
  instructionsFrench: z.string(),
  language: z.literal('french'),
  tags: z.array(
    z.object({
      french: z.string()
    })
  ),
  titleFrench: z.string()
});

const bilingualInfoFormDataSchema = z
  .intersection(
    englishInfoFormDataSchema.omit({ language: true, tags: true }),
    frenchInfoFormDataSchema.omit({ language: true, tags: true })
  )
  .and(
    z.object({
      language: z.literal('bilingual'),
      tags: z.array(
        z.object({
          english: z.string(),
          french: z.string()
        })
      )
    })
  );

const infoFormDataSchema = z.union([englishInfoFormDataSchema, frenchInfoFormDataSchema, bilingualInfoFormDataSchema]);

type InfoFormData = z.infer<typeof infoFormDataSchema>;

export type InfoFormProps = {
  onSubmit: (data: FormInstrumentInfoData) => void;
};

export const InfoForm = ({ onSubmit }: InfoFormProps) => {
  const { updateIndex } = useContext(StepperContext);
  const { i18n, t } = useTranslation(['instruments', 'common']);
  const notifications = useNotificationsStore();
  const defaultLanguage = i18n.resolvedLanguage === 'en' ? 'english' : 'french';

  return (
    <Form<InfoFormData>
      content={[
        {
          title: t('create.basicMetadata'),
          fields: {
            name: {
              kind: 'text',
              label: t('instruments:props.name'),
              variant: 'short'
            },
            estimatedDuration: {
              kind: 'numeric',
              label: t('instruments:props.estimatedDuration'),
              variant: 'default'
            },
            language: {
              kind: 'options',
              label: t('common:language'),
              options: {
                english: t('common:languages.english'),
                french: t('common:languages.french'),
                bilingual: t('common:bilingual')
              }
            },
            version: {
              kind: 'numeric',
              label: 'Version',
              variant: 'default'
            }
          }
        },
        createBilingualFieldGroup({
          baseFieldName: 'title',
          defaultLanguage,
          label: t('props.title')
        }),
        createBilingualFieldGroup({
          baseFieldName: 'description',
          defaultLanguage,
          label: t('props.description')
        }),
        createBilingualFieldGroup({
          baseFieldName: 'instructions',
          defaultLanguage,
          label: t('props.instructions')
        }),
        {
          title: t('props.tags'),
          fields: {
            tags: createBilingualArrayField({
              defaultLanguage,
              label: t('props.tag')
            })
          }
        }
      ]}
      validationSchema={infoFormDataSchema}
      onError={() => {
        notifications.addNotification({ message: t('create.errors.validationFailed'), type: 'error' });
      }}
      onSubmit={(data) => {
        onSubmit({
          details: {
            description: match(data)
              .with({ language: 'bilingual' }, ({ descriptionEnglish, descriptionFrench }) => ({
                en: descriptionEnglish,
                fr: descriptionFrench
              }))
              .with({ language: 'english' }, ({ descriptionEnglish }) => descriptionEnglish)
              .with({ language: 'french' }, ({ descriptionFrench }) => descriptionFrench)
              .exhaustive(),
            estimatedDuration: data.estimatedDuration,
            instructions: match(data)
              .with({ language: 'bilingual' }, ({ instructionsEnglish, instructionsFrench }) => ({
                en: instructionsEnglish,
                fr: instructionsFrench
              }))
              .with({ language: 'english' }, ({ instructionsEnglish }) => instructionsEnglish)
              .with({ language: 'french' }, ({ instructionsFrench }) => instructionsFrench)
              .exhaustive(),
            title: match(data)
              .with({ language: 'bilingual' }, ({ titleEnglish, titleFrench }) => ({
                en: titleEnglish,
                fr: titleFrench
              }))
              .with({ language: 'english' }, ({ titleEnglish }) => titleEnglish)
              .with({ language: 'french' }, ({ titleFrench }) => titleFrench)
              .exhaustive()
          },
          kind: 'form',
          language: match(data)
            .with({ language: 'bilingual' }, () => ['en', 'fr'] as Language[])
            .with({ language: 'english' }, () => 'en' as Language)
            .with({ language: 'french' }, () => 'fr' as Language)
            .exhaustive(),
          name: data.name,
          tags: match(data)
            .with({ language: 'bilingual' }, ({ tags }) => ({
              en: tags.map((tag) => tag.english),
              fr: tags.map((tag) => tag.french)
            }))
            .with({ language: 'english' }, ({ tags }) => tags.map((tag) => tag.english))
            .with({ language: 'french' }, ({ tags }) => tags.map((tag) => tag.french))
            .exhaustive(),
          version: data.version
        });
        updateIndex('increment');
      }}
    />
  );
};
