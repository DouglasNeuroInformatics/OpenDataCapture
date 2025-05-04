import type { Meta, StoryObj } from '@storybook/react-vite';

import { SaveButton } from './SaveButton';

type Story = StoryObj<typeof SaveButton>;

export default { component: SaveButton } as Meta<typeof SaveButton>;

export const Default: Story = {};
