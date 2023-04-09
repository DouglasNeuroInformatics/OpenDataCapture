import type { Meta, StoryObj } from '@storybook/react';

import { FormCreator } from './FormCreator';

type Story = StoryObj<typeof FormCreator>;

export default { component: FormCreator } as Meta<typeof FormCreator>;

export const Default: Story = {};
