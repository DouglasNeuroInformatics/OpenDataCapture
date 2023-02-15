import type { Meta, StoryObj } from '@storybook/react';

import { DynamicForm } from './DynamicForm';

type Story = StoryObj<typeof DynamicForm>;

export default { component: DynamicForm } as Meta<typeof DynamicForm>;

export const Default: Story = {};
