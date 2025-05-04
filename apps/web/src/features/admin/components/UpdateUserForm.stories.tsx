import type { Meta, StoryObj } from '@storybook/react-vite';

import { UpdateUserForm } from './UpdateUserForm';

type Story = StoryObj<typeof UpdateUserForm>;

export default { component: UpdateUserForm } as Meta<typeof UpdateUserForm>;

export const Default: Story = {
  args: {
    data: {
      disableDelete: false,
      groupOptions: {},
      initialValues: {
        additionalPermissions: [
          {
            action: 'create',
            subject: 'User'
          }
        ]
      }
    },
    onDelete: () => alert('Delete!'),
    onSubmit: (data) => alert(JSON.stringify({ data }))
  }
};
