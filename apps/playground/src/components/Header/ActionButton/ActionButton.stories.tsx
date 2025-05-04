import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileQuestionIcon } from 'lucide-react';

import { ActionButton } from './ActionButton';

type Story = StoryObj<typeof ActionButton>;

export default { component: ActionButton } as Meta<typeof ActionButton>;

export const Default: Story = {
  args: {
    icon: <FileQuestionIcon />,
    tooltip: 'Help'
  }
};
