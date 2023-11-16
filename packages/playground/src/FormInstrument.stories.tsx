import type { Meta, StoryObj } from '@storybook/react';

import { FormInstrument } from './FormInstrument';
import formInstrument from './FormInstrument.example';

type Story = StoryObj<typeof FormInstrument>;

export default { component: FormInstrument } as Meta<typeof FormInstrument>;

export const Default: Story = {
  args: {
    instrument: formInstrument
  }
};
