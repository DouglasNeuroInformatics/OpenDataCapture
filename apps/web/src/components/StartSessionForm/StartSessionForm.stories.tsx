import type { Meta, StoryObj } from '@storybook/react-vite';

import { StartSessionForm } from './StartSessionForm';

type Story = StoryObj<typeof StartSessionForm>;

export default { component: StartSessionForm } as Meta<typeof StartSessionForm>;

export const Default: Story = {
  args: {
    customSubjectIds: ['SUBJECT_001', 'SUBJECT_002', 'SUBJECT_003'],
    onSubmit(data) {
      alert(JSON.stringify(data, null, 2));
    }
  }
};
