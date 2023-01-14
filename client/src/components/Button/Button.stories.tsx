import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import Button from './Button';

export default {
  argTypes: {
    label: {
      defaultValue: 'Click Me!'
    },
    onClick: {
      action: 'click'
    }
  },
  component: Button
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary'
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary'
};
