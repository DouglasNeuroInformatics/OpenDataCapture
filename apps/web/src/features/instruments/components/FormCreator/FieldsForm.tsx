/* eslint-disable no-alert */
import { useContext } from 'react';

import type { FormFieldKind, NumericFormField, TextFormField } from '@douglasneuroinformatics/form-types';
import { Form, StepperContext, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

type RawFieldData = {
  description?: string;
  kind: FormFieldKind;
  label: string;
  max?: number;
  min?: number;
  name: string;
  options?: string;
  variant?: NumericFormField['variant'] | TextFormField['variant'];
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

export type FieldsFormProps = {
  onSubmit: (data: FieldsFormData) => void;
};

export const FieldsForm = ({ onSubmit }: FieldsFormProps) => {
  const { updateIndex } = useContext(StepperContext);
  const notifications = useNotificationsStore();
  const { t } = useTranslation();

  const handleSubmit = (data: RawFieldsFormData) => {
    const fieldNames: string[] = [];
    let formattedFields: FieldData[];
    try {
      formattedFields = data.fields.map(({ name, options, ...rest }) => {
        if (fieldNames.includes(name)) {
          throw new Error(`${t('instruments.createInstrument.errors.duplicateField')}: '${name}'`);
        }
        fieldNames.push(name);

        if (options === undefined) {
          return { ...rest, name, options };
        }

        const formattedOptions = Object.fromEntries(
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
        ) as Record<string, string>;

        return { ...rest, name, options: formattedOptions };
      });
    } catch (error) {
      if (error instanceof Error) {
        notifications.addNotification({ message: error.message, type: 'error' });
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
          fieldset: {
            description: {
              kind: 'text',
              label: 'Description',
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
            label: {
              kind: 'text',
              label: 'Label',
              variant: 'short'
            },
            max: ({ kind }) => {
              return kind === 'numeric'
                ? {
                    kind: 'numeric',
                    label: 'Maximum Value',
                    max: Number.MAX_SAFE_INTEGER,
                    min: 0,
                    variant: 'default'
                  }
                : null;
            },
            min: ({ kind }) => {
              return kind === 'numeric'
                ? {
                    kind: 'numeric',
                    label: 'Minimum Value',
                    max: Number.MAX_SAFE_INTEGER,
                    min: 0,
                    variant: 'default'
                  }
                : null;
            },
            name: {
              kind: 'text',
              label: 'Name',
              variant: 'short'
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
                      long: 'Long',
                      password: 'Password',
                      short: 'Short'
                    }
                  };
                default:
                  return null;
              }
            }
          },
          kind: 'array',
          label: 'Field'
        }
      }}
      validationSchema={{
        properties: {
          fields: {
            items: {
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
                        enum: ['short', 'long', 'password'],
                        type: 'string'
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
                        minLength: 1,
                        nullable: false,
                        type: 'string'
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
                      max: {
                        maximum: Number.MAX_SAFE_INTEGER,
                        minimum: 0,
                        nullable: false,
                        type: 'number'
                      },
                      min: {
                        maximum: Number.MAX_SAFE_INTEGER,
                        minimum: 0,
                        nullable: false,
                        type: 'number'
                      },
                      variant: {
                        enum: ['default', 'slider'],
                        type: 'string'
                      }
                    }
                  }
                }
              ],
              properties: {
                description: {
                  minLength: 1,
                  nullable: true,
                  type: 'string'
                },
                kind: {
                  enum: ['binary', 'date', 'numeric', 'options', 'text'],
                  type: 'string'
                },
                label: {
                  minLength: 1,
                  type: 'string'
                },
                max: {
                  nullable: true,
                  type: 'number'
                },
                min: {
                  nullable: true,
                  type: 'number'
                },
                name: {
                  minLength: 1,
                  pattern: /^\S+$/.source,
                  type: 'string'
                },
                options: {
                  nullable: true,
                  type: 'string'
                },
                variant: {
                  nullable: true,
                  type: 'string'
                }
              },
              required: ['kind', 'name', 'label'],
              type: 'object'
            },
            type: 'array'
          }
        },
        required: ['fields'],
        type: 'object'
      }}
      onSubmit={handleSubmit}
    />
  );
};
