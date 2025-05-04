import type { Meta, StoryObj } from '@storybook/react-vite';

import { InstrumentIcon } from './InstrumentIcon';

type Story = StoryObj<typeof InstrumentIcon>;

export default { component: InstrumentIcon } as Meta<typeof InstrumentIcon>;

export const Form: Story = {
  args: {
    kind: 'FORM'
  }
};

export const Interactive: Story = {
  args: {
    kind: 'INTERACTIVE'
  }
};
