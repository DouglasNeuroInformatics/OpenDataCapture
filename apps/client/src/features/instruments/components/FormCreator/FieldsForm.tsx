/* eslint-disable no-alert */
import React, { useContext } from 'react';

import { FormFieldKind, NumericFormField, TextFormField } from '@ddcp/common';

import { Form } from '@/components';
import { StepperContext } from '@/context/StepperContext';

export type FieldsFormData = {
  fields: Array<{
    name: string;
    kind: FormFieldKind;
    label: string;
    description?: string;
    variant?: TextFormField['variant'] | NumericFormField['variant'];
    options?: string;
    min?: number;
    max?: number;
  }>;
};

export interface FieldsFormProps {
  onSubmit: (data: FieldsFormData) => void;
}

export const FieldsForm = ({ onSubmit }: FieldsFormProps) => {
  const { updateIndex } = useContext(StepperContext);

  return (
    <Form<FieldsFormData>
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
                    description: 'Please enter all options',
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
                  enum: ['array', 'binary', 'date', 'numeric', 'options', 'text']
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
                  minLength: 1,
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
      onSubmit={(data) => {
        onSubmit(data);
        updateIndex('increment');
      }}
    />
  );
};
