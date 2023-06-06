/* eslint-disable no-alert */
import React, { useContext } from 'react';

import { FormFieldKind, NumericFormField, TextFormField } from '@douglasneuroinformatics/common';
import { Form, useNotificationsStore } from '@douglasneuroinformatics/react-components';
import { useTranslation } from 'react-i18next';

import { StepperContext } from '@/context/StepperContext';

type RawFieldData = {
  name: string;
  kind: FormFieldKind;
  label: string;
  description?: string;
  variant?: TextFormField['variant'] | NumericFormField['variant'];
  options?: string;
  min?: number;
  max?: number;
};

type FieldData = Omit<RawFieldData, 'options'> & {
  options?: Record<string, string>;
};

type RawFieldsFormData = {
  fields: RawFieldData[];
};

export type FieldsFormData = {
  fields: FieldData[];
};

export interface FieldsFormProps {
  onSubmit: (data: FieldsFormData) => void;
}

export const FieldsForm = ({ onSubmit }: FieldsFormProps) => {
  const { updateIndex } = useContext(StepperContext);
  const notifications = useNotificationsStore();
  const { t } = useTranslation();

  const handleSubmit = (data: RawFieldsFormData) => {
    const fieldNames: string[] = [];
    let formattedFields: FieldData[];
    try {
      formattedFields = data.fields.map(({ options, name, ...rest }) => {
        if (fieldNames.includes(name)) {
          throw new Error(`${t('instruments.createInstrument.errors.duplicateField')}: '${name}'`);
        }
        fieldNames.push(name);

        if (options === undefined || options === null) {
          return { ...rest, name, options };
        }

        const formattedOptions: Record<string, string> = Object.fromEntries(
          options
            .split('\n')
            .filter((s) => s)
            .map((option) => {
              const items = option.split(':').map((item) => item.trim());
              if (items.length !== 2) {
                throw new Error(`${t('instruments.createInstrument.errors.invalidOptionFormat')}: '${option}'`);
              }
              return [items[0], items[1]];
            })
        );

        return { ...rest, name, options: formattedOptions };
      });
    } catch (error) {
      if (error instanceof Error) {
        notifications.addNotification({ type: 'error', message: error.message });
      }
      console.error(error);
      return;
    }

    onSubmit({ ...data, fields: formattedFields });
    updateIndex('increment');
  };

  return (
    <Form<RawFieldsFormData>
      content={{
        fields: {
          kind: 'array',
          label: 'Field',
          fieldset: {
            name: {
              kind: 'text',
              label: 'Name',
              variant: 'short'
            },
            kind: {
              kind: 'options',
              label: 'Kind',
              options: {
                text: 'Text',
                numeric: 'Numeric',
                options: 'Options',
                date: 'Date',
                binary: 'Binary'
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
            },
            variant: ({ kind }) => {
              const base = { kind: 'options', label: 'Variant' } as const;
              switch (kind) {
                case 'numeric':
                  return {
                    ...base,
                    options: {
                      default: 'Default',
                      slider: 'Slider'
                    }
                  };
                case 'text':
                  return {
                    ...base,
                    options: {
                      short: 'Short',
                      long: 'Long',
                      password: 'Password'
                    }
                  };
                default:
                  return null;
              }
            },
            options: ({ kind }) => {
              return kind === 'options'
                ? {
                    description: 'Please enter options in the format {KEY}:{LABEL}, separated by newlines',
                    kind: 'text',
                    label: 'Options',
                    variant: 'long'
                  }
                : null;
            },
            min: ({ kind }) => {
              return kind === 'numeric'
                ? {
                    kind: 'numeric',
                    label: 'Minimum Value',
                    variant: 'default',
                    min: 0,
                    max: Number.MAX_SAFE_INTEGER
                  }
                : null;
            },
            max: ({ kind }) => {
              return kind === 'numeric'
                ? {
                    kind: 'numeric',
                    label: 'Maximum Value',
                    variant: 'default',
                    min: 0,
                    max: Number.MAX_SAFE_INTEGER
                  }
                : null;
            }
          }
        }
      }}
      validationSchema={{
        type: 'object',
        properties: {
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                kind: {
                  type: 'string',
                  enum: ['binary', 'date', 'numeric', 'options', 'text']
                },
                name: {
                  type: 'string',
                  pattern: /^\S+$/.source,
                  minLength: 1
                },
                label: {
                  type: 'string',
                  minLength: 1
                },
                description: {
                  type: 'string',
                  minLength: 1,
                  nullable: true
                },
                variant: {
                  type: 'string',
                  nullable: true
                },
                options: {
                  type: 'string',
                  nullable: true
                },
                min: {
                  type: 'number',
                  nullable: true
                },
                max: {
                  type: 'number',
                  nullable: true
                }
              },
              required: ['kind', 'name', 'label'],
              allOf: [
                {
                  if: {
                    properties: {
                      kind: {
                        const: 'text'
                      }
                    }
                  },
                  then: {
                    properties: {
                      variant: {
                        type: 'string',
                        enum: ['short', 'long', 'password']
                      }
                    }
                  }
                },
                {
                  if: {
                    properties: {
                      kind: {
                        const: 'options'
                      }
                    }
                  },
                  then: {
                    properties: {
                      options: {
                        type: 'string',
                        minLength: 1,
                        nullable: false
                      }
                    }
                  }
                },
                {
                  if: {
                    properties: {
                      kind: {
                        const: 'numeric'
                      }
                    }
                  },
                  then: {
                    properties: {
                      variant: {
                        type: 'string',
                        enum: ['default', 'slider']
                      },
                      min: {
                        type: 'number',
                        minimum: 0,
                        maximum: Number.MAX_SAFE_INTEGER,
                        nullable: false
                      },
                      max: {
                        type: 'number',
                        minimum: 0,
                        maximum: Number.MAX_SAFE_INTEGER,
                        nullable: false
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        required: ['fields']
      }}
      onSubmit={handleSubmit}
    />
  );
};
