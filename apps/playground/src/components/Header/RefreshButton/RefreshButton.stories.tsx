import type { Meta, StoryObj } from '@storybook/react-vite';

import { RefreshButton } from './RefreshButton';

type Story = StoryObj<typeof RefreshButton>;

export default { component: RefreshButton } as Meta<typeof RefreshButton>;

export const Default: Story = {};
