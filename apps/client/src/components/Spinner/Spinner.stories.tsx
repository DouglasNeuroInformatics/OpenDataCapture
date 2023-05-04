import type { Meta, StoryObj } from '@storybook/react';

import { Spinner } from './Spinner';

type Story = StoryObj<typeof Spinner>;

export default { component: Spinner } as Meta<typeof Spinner>;

export const Default: Story = {};
