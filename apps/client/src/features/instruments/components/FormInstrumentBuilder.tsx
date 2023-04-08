/* eslint-disable no-alert */
import React from 'react';

import { BaseFormField, FormFieldKind, Language } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Button, Form, TextField } from '@/components';

type CreateFormData = {
  title: string;
  description: string;
  language: Language;
  instructions: string;
  estimatedDuration: number;
  fields: Array<{
    kind: FormFieldKind;

    /** The label to be displayed to the user */
    label: string;

    /** An optional description of this field */
    description?: string;

    /** Whether or not the field is required */
    isRequired?: boolean;
  }>;
};

export const FormInstrumentBuilder = () => {
  const { t } = useTranslation(['common', 'instruments']);

  return (
    <Form<CreateFormData>
      content={[
        {
          title: 'Instrument Details',
          fields: {
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
          }
        },
        {
          title: 'Fields',
          fields: {
            fields: {
              kind: 'array',
              label: 'Fields',
              fieldset: {
                kind: {
                  kind: 'options',
                  label: 'Kind',
                  options: {
                    text: 'Text',
                    numeric: 'Numeric',
                    options: 'Options',
                    date: 'Date',
                    binary: 'Binary',
                    array: 'Array'
                  }
                },
                label: {
                  kind: 'text',
                  label: 'Label',
                  variant: 'short'
                },
                description: {
                  kind: 'text',
                  label: 'Description',
                  variant: 'short'
                }
              }
            }
          }
        }
      ]}
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
          },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              required: []
            }
          }
        },
        required: ['description', 'estimatedDuration', 'instructions', 'language', 'title']
      }}
      onSubmit={(data) => alert(JSON.stringify(data))}
    />
  );
};
