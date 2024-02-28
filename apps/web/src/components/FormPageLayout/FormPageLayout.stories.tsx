import { Form } from '@douglasneuroinformatics/ui';
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
            kind: 'text',
            label: 'Value 1',
            variant: 'short'
          },
          v2: {
            kind: 'text',
            label: 'Value 2',
            variant: 'short'
          },
          v3: {
            kind: 'text',
            label: 'Value 3',
            variant: 'short'
          },
          v4: {
            kind: 'text',
            label: 'Value 4',
            variant: 'short'
          },
          v5: {
            kind: 'text',
            label: 'Value 5',
            variant: 'short'
          },
          v6: {
            kind: 'text',
            label: 'Value 6',
            variant: 'long'
          },
          v7: {
            kind: 'text',
            label: 'Value 7',
            variant: 'long'
          },
          v8: {
            kind: 'text',
            label: 'Value 8',
            variant: 'short'
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
