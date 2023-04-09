/* eslint-disable no-alert */
import React from 'react';

import { FormDetails } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components';

export const DetailsForm = () => {
  const { t } = useTranslation(['common', 'instruments']);

  return (
    <Form<FormDetails>
      content={{
        title: {
          kind: 'text',
          label: t('instruments:createInstrument.form.title.label'),
          variant: 'short'
        },
        description: {
          kind: 'text',
          label: t('instruments:createInstrument.form.description.label'),
          variant: 'long'
        },
        language: {
          kind: 'options',
          label: t('instruments:createInstrument.form.language.label'),
          options: {
            en: t('languages.en'),
            fr: t('languages.fr')
          }
        },
        instructions: {
          kind: 'text',
          label: t('instruments:createInstrument.form.instructions.label'),
          variant: 'long'
        },
        estimatedDuration: {
          kind: 'numeric',
          label: t('instruments:createInstrument.form.estimatedDuration.label'),
          min: 1,
          max: 60
        }
      }}
      validationSchema={{
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 1
          },
          description: {
            type: 'string',
            minLength: 1
          },
          language: {
            type: 'string',
            enum: ['en', 'fr']
          },
          instructions: {
            type: 'string',
            minLength: 1
          },
          estimatedDuration: {
            type: 'integer',
            minimum: 1,
            maximum: 60
          }
        },
        required: ['description', 'estimatedDuration', 'instructions', 'language', 'title']
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    />
  );
};
