import { Form } from '@douglasneuroinformatics/libui/components';
import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';

import { FormPageLayout } from './FormPageLayout';

type Story = StoryObj<typeof FormPageLayout>;

const meta: Meta<typeof FormPageLayout> = {
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
          },
          v7: {
            kind: 'string',
            label: 'Value 7',
            variant: 'textarea'
          },
          v8: {
            kind: 'string',
            label: 'Value 8',
            variant: 'input'
          }
        }}
        validationSchema={z.record(z.any())}
        onSubmit={(data) => {
          alert(JSON.stringify(data));
        }}
      />
    ),
    title: 'Example'
  },
  component: FormPageLayout,
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;

export const Default: Story = {};
