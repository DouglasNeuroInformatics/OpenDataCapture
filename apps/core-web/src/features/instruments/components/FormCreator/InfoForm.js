import React, { useContext } from 'react';
import { Form, StepperContext } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
export var InfoForm = function (_a) {
  var onSubmit = _a.onSubmit;
  var updateIndex = useContext(StepperContext).updateIndex;
  var t = useTranslation().t;
  return React.createElement(Form, {
    content: [
      {
        title: t('instruments.createInstrument.form.basics'),
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
            min: 0,
            max: 10,
            variant: 'default'
          }
        }
      },
      {
        title: t('instruments.createInstrument.form.details'),
        fields: {
          title: {
            kind: 'text',
            label: t('instruments.createInstrument.form.title.label'),
            variant: 'short'
          },
          description: {
            kind: 'text',
            label: t('instruments.createInstrument.form.description.label'),
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
          instructions: {
            kind: 'text',
            label: t('instruments.createInstrument.form.instructions.label'),
            variant: 'long'
          },
          estimatedDuration: {
            kind: 'numeric',
            label: t('instruments.createInstrument.form.estimatedDuration.label'),
            min: 1,
            max: 60,
            variant: 'default'
          }
        }
      }
    ],
    validationSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          pattern: /^\S+$/.source
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
    },
    onSubmit: function (data) {
      onSubmit(data);
      updateIndex('increment');
    }
  });
};
