import type { Meta, StoryObj } from '@storybook/react';

import { Viewer } from './Viewer';

type Story = StoryObj<typeof Viewer>;

export default { component: Viewer } as Meta<typeof Viewer>;

export const Default: Story = {};
