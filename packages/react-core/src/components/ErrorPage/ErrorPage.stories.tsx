import type { Meta, StoryObj } from '@storybook/react';

import { ErrorPage } from './ErrorPage';

type Story = StoryObj<typeof ErrorPage>;

export default { component: ErrorPage } as Meta<typeof ErrorPage>;

export const Default: Story = {};
