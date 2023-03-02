import type { Meta, StoryObj } from '@storybook/react';

import { RadioField } from './RadioField';

type Story = StoryObj<typeof RadioField>;

export default { component: RadioField } as Meta<typeof RadioField>;

export const Default: Story = {
  args: {
    name: 'radio',
    value: 'foo'
  }
};
