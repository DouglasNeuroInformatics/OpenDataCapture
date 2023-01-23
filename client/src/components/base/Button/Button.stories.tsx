import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Button } from './Button';

export default { component: Button } as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Dark = Template.bind({});

Dark.args = {
  label: 'Dark Button',
  variant: 'dark'
};

export const Light = Template.bind({});

Light.args = {
  label: 'Light Button',
  variant: 'light'
};
