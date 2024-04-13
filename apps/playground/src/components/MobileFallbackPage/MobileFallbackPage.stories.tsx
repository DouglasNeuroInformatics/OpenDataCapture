import type { Meta, StoryObj } from '@storybook/react';

import { MobileFallbackPage } from './MobileFallbackPage';

type Story = StoryObj<typeof MobileFallbackPage>;

export default { component: MobileFallbackPage } as Meta<typeof MobileFallbackPage>;

export const Default: Story = {};
