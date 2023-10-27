/* eslint-disable perfectionist/sort-objects */

import { useContext } from 'react';

import type { PrimitiveFieldValue } from '@douglasneuroinformatics/form-types';
import { Form, StepperContext, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export type ContentFormData = {
  fields: Record<string, PrimitiveFieldValue>[];
  structure: 'flat' | 'grouped';
};

export type ContentFormProps = {
  onSubmit: (data: Record<string, never>) => void;
};

export const ContentForm = ({ onSubmit }: ContentFormProps) => {
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation('instruments');
  const notifications = useNotificationsStore();

  return (
    <Form<ContentFormData>
      content={{
        structure: {
          kind: 'options',
          label: t('create.content.structure'),
          options: {
            flat: t('create.content.flat'),
            grouped: t('create.content.grouped')
          }
        },
        fields: {
          kind: 'array',
          label: t('create.content.field'),
          fieldset: {
            name: {
              kind: 'text',
              label: 'Name',
              variant: 'short'
            },
            description: {
              kind: 'text',
              label: 'Description',
              variant: 'short'
            },
            label: {
              kind: 'text',
              label: 'Label',
              variant: 'short'
            },
            kind: {
              kind: 'options',
              label: 'Kind',
              options: {
                binary: 'Binary',
                date: 'Date',
                numeric: 'Numeric',
                options: 'Options',
                text: 'Text'
              }
            },
            max: {
              kind: 'dynamic-fieldset',
              render: ({ kind }) => {
                return kind === 'numeric'
                  ? {
                      kind: 'numeric',
                      label: 'Maximum Value',
                      max: Number.MAX_SAFE_INTEGER,
                      min: 0,
                      variant: 'default'
                    }
                  : null;
              }
            },
            min: {
              kind: 'dynamic-fieldset',
              render: ({ kind }) => {
                return kind === 'numeric'
                  ? {
                      kind: 'numeric',
                      label: 'Minimum Value',
                      max: Number.MAX_SAFE_INTEGER,
                      min: 0,
                      variant: 'default'
                    }
                  : null;
              }
            },
            options: {
              kind: 'dynamic-fieldset',
              render: ({ kind }) => {
                return kind === 'options'
                  ? {
                      description: 'Please enter options in the format {KEY}:{LABEL}, separated by newlines',
                      kind: 'text',
                      label: 'Options',
                      variant: 'long'
                    }
                  : null;
              }
            }
          }
        }
      }}
      validationSchema={z.object({
        fields: z.array(z.record(z.any())),
        structure: z.enum(['flat', 'grouped'])
      })}
      onError={() => {
        notifications.addNotification({ message: t('create.errors.validationFailed'), type: 'error' });
      }}
      onSubmit={() => {
        onSubmit({});
        updateIndex('increment');
      }}
    />
  );
};
