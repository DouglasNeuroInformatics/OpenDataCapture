import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './Checkbox';

type Story = StoryObj<typeof Checkbox>;

export default { component: Checkbox } as Meta<typeof Checkbox>;

export const Default: Story = {};
