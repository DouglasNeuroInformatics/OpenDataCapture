import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

export default { component: Form } as Meta<typeof Form>;

/**
 * Basic Form Example
 */

type BasicFormValues = {
  firstName: string;
  lastName: string;
  sex: 'male' | 'female';
  dateOfBirth: string;
  countryOfBirth: string;
  arrayField: Array<{ f1: string; f2: string }>;
};

export const BasicForm: StoryObj<typeof Form<BasicFormValues>> = {
  args: {
    structure: [
      {
        fields: {
          firstName: {
            kind: 'text',
            label: 'First Name',
            variant: 'short'
          },
          lastName: {
            kind: 'text',
            label: 'Last Name',
            variant: 'short'
          },
          sex: {
            kind: 'select',
            label: 'Sex',
            options: ['male', 'female']
          },
          dateOfBirth: {
            kind: 'date',
            label: 'Date of Birth'
          }
        }
      },
      {
        title: 'Optional Fields',
        fields: {
          countryOfBirth: {
            kind: 'text',
            label: 'Country of Birth',
            variant: 'short'
          }
        }
      },
      {
        title: 'Dynamic Fields',
        fields: {
          arrayField: {
            kind: 'array',
            fieldset: {
              f1: {
                kind: 'text',
                label: 'Field 1',
                variant: 'short'
              },
              f2: {
                kind: 'text',
                label: 'Field 2',
                variant: 'short'
              }
            }
          }
        }
      }
    ],
    validationSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          minLength: 1
        },
        lastName: {
          type: 'string',
          minLength: 1
        },
        sex: {
          type: 'string',
          enum: ['male', 'female']
        },
        dateOfBirth: {
          type: 'string',
          format: 'date'
        },
        countryOfBirth: {
          type: 'string'
        },
        arrayField: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              f1: {
                type: 'string',
                minLength: 1
              },
              f2: {
                type: 'string',
                minLength: 1
              }
            },
            required: ['f1', 'f2']
          }
        }
      },
      additionalProperties: false,
      required: ['firstName', 'lastName', 'sex', 'dateOfBirth', 'arrayField']
    },
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};

/**
 * Conditional Form Example
 */

type ConditionalFormValues = {
  streetAddress: string;
  country: string;
  postalCode: string;
};

export const ConditionalForm: StoryObj<typeof Form<ConditionalFormValues>> = {
  args: {
    structure: [
      {
        fields: {
          streetAddress: {
            kind: 'text',
            label: 'Street Address',
            variant: 'short'
          },
          country: {
            kind: 'select',
            label: 'Country',
            options: ['Canada', 'USA']
          },
          postalCode: {
            kind: 'text',
            label: 'Postal Code',
            variant: 'short'
          }
        }
      }
    ],
    validationSchema: {
      type: 'object',
      properties: {
        streetAddress: {
          type: 'string',
          minLength: 1
        },
        country: {
          type: 'string',
          enum: ['Canada', 'USA']
        },
        postalCode: {
          type: 'string'
        }
      },
      if: {
        properties: { country: { const: 'USA' } }
      },
      then: {
        properties: {
          postalCode: {
            pattern: '[0-9]{5}(-[0-9]{4})?',
            type: 'string'
          }
        }
      },
      else: {
        properties: {
          postalCode: {
            pattern: '[A-Z][0-9][A-Z] [0-9][A-Z][0-9]',
            type: 'string'
          }
        }
      },
      required: ['country', 'postalCode', 'streetAddress']
    },
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
