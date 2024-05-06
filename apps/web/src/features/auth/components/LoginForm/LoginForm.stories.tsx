import type { Meta, StoryObj } from '@storybook/react';

import { LoginForm } from './LoginForm';

type Story = StoryObj<typeof LoginForm>;

export default { component: LoginForm } as Meta<typeof LoginForm>;

export const Default: Story = {};
