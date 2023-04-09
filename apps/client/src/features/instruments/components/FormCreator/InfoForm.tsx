import React, { useContext } from 'react';

import { FormDetails, FormInstrument } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components';
import { StepperContext } from '@/context/StepperContext';

export type InfoFormData = FormDetails &
  Pick<FormInstrument, 'name' | 'version'> & {
    tags: string;
  };

export interface InfoFormProps {
  onSubmit: (data: InfoFormData) => void;
}

export const InfoForm = ({ onSubmit }: InfoFormProps) => {
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation(['common', 'instruments']);

  return (
    <Form<InfoFormData>
      content={[
        {
          title: 'Basics',
          fields: {
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
            }
          }
        },
        {
          title: 'Details',
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
        }
      ]}
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
      onSubmit={(data) => {
        onSubmit(data);
        updateIndex('increment');
      }}
    />
  );
};
