import React from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';

import { FormPageLayout } from './FormPageLayout';

type Story = StoryObj<typeof FormPageLayout>;

export default {
  component: FormPageLayout,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof FormPageLayout>;

export const Small: Story = {
  args: {
    children: (
      <Form
        content={{
          v1: {
            kind: 'string',
            label: 'Username',
            variant: 'input'
          },
          v2: {
            kind: 'string',
            label: 'Password',
            variant: 'input'
          }
        }}
        validationSchema={z.record(z.string())}
        onSubmit={(data) => {
          alert(JSON.stringify(data));
        }}
      />
    ),
    maxWidth: 'sm',
    title: 'Login'
  }
};

export const Medium: Story = {
  args: {
    children: (
      <Form
        content={{
          v1: {
            kind: 'string',
            label: 'Value 1',
            variant: 'input'
          },
          v2: {
            kind: 'string',
            label: 'Value 2',
            variant: 'input'
          },
          v3: {
            kind: 'string',
            label: 'Value 3',
            variant: 'input'
          },
          v4: {
            kind: 'string',
            label: 'Value 4',
            variant: 'input'
          }
        }}
        validationSchema={z.record(z.string())}
        onSubmit={(data) => {
          alert(JSON.stringify(data));
        }}
      />
    ),
    maxWidth: 'md',
    title: 'Example'
  }
};

export const Large: Story = {
  args: {
    children: (
      <Form
        content={{
          v1: {
            kind: 'string',
            label: 'Value 1',
            variant: 'input'
          },
          v2: {
            kind: 'string',
            label: 'Value 2',
            variant: 'input'
          },
          v3: {
            kind: 'string',
            label: 'Value 3',
            variant: 'input'
          },
          v4: {
            kind: 'string',
            label: 'Value 4',
            variant: 'input'
          },
          v5: {
            kind: 'string',
            label: 'Value 5',
            variant: 'input'
          },
          v6: {
            kind: 'string',
            label: 'Value 6',
            variant: 'textarea'
          }
        }}
        validationSchema={z.record(z.string())}
        onSubmit={(data) => {
          alert(JSON.stringify(data));
        }}
      />
    ),
    maxWidth: 'lg',
    title: 'Example'
  }
};
