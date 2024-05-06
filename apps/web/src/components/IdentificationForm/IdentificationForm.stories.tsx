import type { Meta, StoryObj } from '@storybook/react';

import { IdentificationForm } from './IdentificationForm';

type Story = StoryObj<typeof IdentificationForm>;

export default { component: IdentificationForm } as Meta<typeof IdentificationForm>;

export const Default: Story = {};
