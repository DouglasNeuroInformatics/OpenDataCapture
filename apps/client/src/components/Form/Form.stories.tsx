import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

export default {
  component: Form,
  decorators: [
    (Story) => (
      <div className="container">
        <h1 className="mb-3 text-center text-3xl">Example Form</h1>
        <Story />
      </div>
    )
  ]
} as Meta<typeof Form>;

type BasicFormValues = {
  textShort: string;
  textLong: string;
  textPassword: string;
  numericDefault: number;
  numericSlider: number;
  options: 'a' | 'b' | 'c';
  date: string;
  binary: boolean;
};

export const BasicForm: StoryObj<typeof Form<BasicFormValues>> = {
  args: {
    content: {
      textShort: {
        kind: 'text',
        label: 'Short Text',
        variant: 'short'
      },
      textLong: {
        kind: 'text',
        label: 'Long Text',
        variant: 'long'
      },
      textPassword: {
        kind: 'text',
        label: 'Password',
        variant: 'password'
      },
      numericDefault: {
        description: 'This is a numeric field',
        kind: 'numeric',
        label: 'Numeric (Default)',
        min: 0,
        max: 10,
        variant: 'default'
      },
      numericSlider: {
        description: 'This is a numeric field',
        kind: 'numeric',
        label: 'Numeric (Slider)',
        min: 0,
        max: 10,
        variant: 'slider'
      },
      options: {
        kind: 'options',
        label: 'Options',
        options: {
          a: 'Option A',
          b: 'Option B',
          c: 'Option C'
        }
      },
      date: {
        kind: 'date',
        label: 'Date'
      },
      binary: {
        kind: 'binary',
        label: 'Binary'
      }
    },
    validationSchema: {
      type: 'object',
      required: []
    },
    onSubmit: (data) => alert(JSON.stringify(data, null, 2))
  }
};

type ArrayFormValues = {
  array: Array<{
    f1: string;
    f2: number;
  }>;
};

export const ArrayForm: StoryObj<typeof Form<ArrayFormValues>> = {
  args: {
    content: {
      array: {
        kind: 'array',
        label: 'Array Field',
        fieldset: {
          f1: {
            kind: 'text',
            label: 'Field 1',
            variant: 'short'
          },
          f2: {
            kind: 'numeric',
            label: 'Field 2',
            min: 0,
            max: 10,
            variant: 'slider'
          }
        }
      }
    },
    validationSchema: {
      type: 'object',
      properties: {
        array: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              f1: {
                type: 'string',
                minLength: 1
              },
              f2: {
                type: 'integer',
                minimum: 0,
                maximum: 10
              }
            },
            required: ['f1', 'f2']
          }
        }
      },
      required: ['array']
    },
    onSubmit: (data) => alert(JSON.stringify(data, null, 2))
  }
};

type GroupedFormValues = {
  f1: string;
  f2: string;
  f3: string;
  f4: string;
};

export const GroupedForm: StoryObj<typeof Form<GroupedFormValues>> = {
  args: {
    content: [
      {
        title: 'Group 1',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Totam et ut aut. Assumenda facilis numquam cupiditate aut in magni quisquam et natus obcaecati dicta eum nulla ducimus, earum alias rerum.',
        fields: {
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
      },
      {
        title: 'Group 2',
        description:
          'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Recusandae natus eaque dolor sequi qui dolore aut at amet fugit, porro, est et maiores, id esse! Esse doloribus laudantium laborum aperiam.',
        fields: {
          f3: {
            kind: 'text',
            label: 'Field 3',
            variant: 'short'
          },
          f4: {
            kind: 'text',
            label: 'Field 4',
            variant: 'short'
          }
        }
      }
    ],
    validationSchema: {
      type: 'object',
      properties: {
        f1: {
          type: 'string',
          minLength: 1
        },
        f2: {
          type: 'string',
          minLength: 1
        },
        f3: {
          type: 'string',
          minLength: 1
        },
        f4: {
          type: 'string',
          minLength: 1
        }
      },
      required: ['f1', 'f2', 'f3', 'f4']
    },
    onSubmit: (data) => alert(JSON.stringify(data, null, 2))
  }
};
