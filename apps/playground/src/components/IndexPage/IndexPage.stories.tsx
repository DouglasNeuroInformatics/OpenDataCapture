import type { Meta, StoryObj } from '@storybook/react';

import { IndexPage } from './IndexPage';

type Story = StoryObj<typeof IndexPage>;

export default { component: IndexPage } as Meta<typeof IndexPage>;

export const Default: Story = {};
