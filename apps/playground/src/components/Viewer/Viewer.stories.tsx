import type { Meta, StoryObj } from '@storybook/react';

import { Viewer as ViewerComponent } from './Viewer';

type Story = StoryObj<typeof ViewerComponent>;

export default { component: ViewerComponent } as Meta<typeof ViewerComponent>;

export const Viewer: Story = {};
