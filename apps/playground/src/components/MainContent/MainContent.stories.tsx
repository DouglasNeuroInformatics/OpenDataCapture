import type { Meta, StoryObj } from '@storybook/react';

import { MainContent } from './MainContent';

type Story = StoryObj<typeof MainContent>;

export default { component: MainContent } as Meta<typeof MainContent>;

export const Default: Story = {};
