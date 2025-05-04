import type { Meta, StoryObj } from '@storybook/react-vite';

import { CloneButton } from './CloneButton';

type Story = StoryObj<typeof CloneButton>;

export default { component: CloneButton } as Meta<typeof CloneButton>;

export const Default: Story = {};
