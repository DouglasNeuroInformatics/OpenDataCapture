import React, { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { SliderField } from './SliderField';

type Story = StoryObj<typeof SliderField>;

export default { component: SliderField } as Meta<typeof SliderField>;

export const Default: Story = {
  decorators: [
    (Story) => {
      const [value, setValue] = useState(50);
      return <Story args={{ value, onChange: (e) => setValue(parseInt(e.target.value)) }} />;
    }
  ]
};
