import type { Meta, StoryObj } from '@storybook/react';

import { Branding } from './Branding';

type Story = StoryObj<typeof Branding>;

export default { component: Branding } satisfies Meta<typeof Branding>;

export const Default: Story = {};
