import type { Meta, StoryObj } from '@storybook/react';

import { Navbar } from './Navbar';

type Story = StoryObj<typeof Navbar>;

export default { component: Navbar } satisfies Meta<typeof Navbar>;

export const Default: Story = {};
