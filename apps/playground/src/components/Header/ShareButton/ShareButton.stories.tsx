import type { Meta, StoryObj } from '@storybook/react-vite';

import { ShareButton } from './ShareButton';

type Story = StoryObj<typeof ShareButton>;

export default { component: ShareButton } as Meta<typeof ShareButton>;

export const Default: Story = {};
