import type { Meta, StoryObj } from '@storybook/react';

import { Logo } from './Logo';

type Story = StoryObj<typeof Logo>;

export default { component: Logo } satisfies Meta<typeof Logo>;

export const Default: Story = {};
