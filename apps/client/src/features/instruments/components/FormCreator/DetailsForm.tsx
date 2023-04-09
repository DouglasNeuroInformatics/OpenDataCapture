/* eslint-disable no-alert */
import React from 'react';

import { FormDetails, FormInstrument } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components';

export type DetailsFormData = FormDetails &
  Pick<FormInstrument, 'name' | 'version'> & {
    tags: string;
  };

export interface DetailsFormProps {
  onSubmit: (data: DetailsFormData) => void;
}

export const DetailsForm = ({ onSubmit }: DetailsFormProps) => {
  const { t } = useTranslation(['common', 'instruments']);

  return (
    <Form<DetailsFormData>
      content={{
        name: {
          kind: 'text',
          label: 'Name',
          variant: 'short'
        },
        tags: {
          kind: 'text',
          label: 'Tags',
          variant: 'short'
        },
        version: {
          kind: 'numeric',
          label: 'Version',
          min: 0,
          max: 10
        },
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
          name: {
            type: 'string',
            minLength: 1
          },
          tags: {
            type: 'string',
            minLength: 1
          },
          version: {
            type: 'number'
          },
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
      onSubmit={onSubmit}
    />
  );
};
