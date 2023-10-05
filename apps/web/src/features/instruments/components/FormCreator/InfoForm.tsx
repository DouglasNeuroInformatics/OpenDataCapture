import { useContext } from 'react';

import { Form, StepperContext } from '@douglasneuroinformatics/ui';
import type { FormDetails, FormInstrument } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

export type InfoFormData = FormDetails &
  Pick<FormInstrument, 'name' | 'version'> & {
    instructions: string;
    tags: string;
  };

export type InfoFormProps = {
  onSubmit: (data: InfoFormData) => void;
};

export const InfoForm = ({ onSubmit }: InfoFormProps) => {
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation();

  return (
    <Form<InfoFormData>
      content={[
        {
          fields: {
            name: {
              kind: 'text',
              label: t('instruments.createInstrument.form.name.label'),
              variant: 'short'
            },
            tags: {
              kind: 'text',
              label: t('instruments.createInstrument.form.tags.label'),
              variant: 'short'
            },
            version: {
              kind: 'numeric',
              label: t('instruments.createInstrument.form.version.label'),
              max: 10,
              min: 0,
              variant: 'default'
            }
          },
          title: t('instruments.createInstrument.form.basics')
        },
        {
          fields: {
            description: {
              kind: 'text',
              label: t('instruments.createInstrument.form.description.label'),
              variant: 'long'
            },
            estimatedDuration: {
              kind: 'numeric',
              label: t('instruments.createInstrument.form.estimatedDuration.label'),
              max: 60,
              min: 1,
              variant: 'default'
            },
            instructions: {
              kind: 'text',
              label: t('instruments.createInstrument.form.instructions.label'),
              variant: 'long'
            },
            language: {
              kind: 'options',
              label: t('instruments.createInstrument.form.language.label'),
              options: {
                en: t('languages.en'),
                fr: t('languages.fr')
              }
            },
            title: {
              kind: 'text',
              label: t('instruments.createInstrument.form.title.label'),
              variant: 'short'
            }
          },
          title: t('instruments.createInstrument.form.details')
        }
      ]}
      validationSchema={{
        properties: {
          description: {
            minLength: 1,
            type: 'string'
          },
          estimatedDuration: {
            maximum: 60,
            minimum: 1,
            type: 'integer'
          },
          instructions: {
            minLength: 1,
            type: 'string'
          },
          language: {
            enum: ['en', 'fr'],
            type: 'string'
          },
          name: {
            minLength: 1,
            pattern: /^\S+$/.source,
            type: 'string'
          },
          tags: {
            minLength: 1,
            type: 'string'
          },
          title: {
            minLength: 1,
            type: 'string'
          },
          version: {
            type: 'number'
          }
        },
        required: ['description', 'estimatedDuration', 'instructions', 'language', 'title'],
        type: 'object'
      }}
      onSubmit={(data) => {
        onSubmit(data);
        updateIndex('increment');
      }}
    />
  );
};
