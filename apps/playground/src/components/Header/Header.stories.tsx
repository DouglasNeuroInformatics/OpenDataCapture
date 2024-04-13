import type { Meta, StoryObj } from '@storybook/react';

import { Header } from './Header';

type Story = StoryObj<typeof Header>;

export default { component: Header } as Meta<typeof Header>;

export const Default: Story = {};
