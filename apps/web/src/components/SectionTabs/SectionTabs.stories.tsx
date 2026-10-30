import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { SectionTabs } from './SectionTabs';

type Story = StoryObj<typeof SectionTabs>;

export default { component: SectionTabs } as Meta<typeof SectionTabs>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<'ACTIVITY' | 'REPOSITORIES'>('REPOSITORIES');
    return (
      <SectionTabs
        data-testid="section-tabs"
        tabs={[
          { label: 'Repositories', value: 'REPOSITORIES' },
          { label: 'Activity Log', value: 'ACTIVITY' }
        ]}
        value={value}
        onValueChange={setValue}
      />
    );
  }
};
