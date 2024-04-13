import type { Meta, StoryObj } from '@storybook/react';

import { PresetSelector } from './PresetSelector';

type Story = StoryObj<typeof PresetSelector>;

import { presets } from '@/data/presets';

export default { component: PresetSelector } as Meta<typeof PresetSelector>;

export const Default: Story = {
  args: {
    presets
  }
};
