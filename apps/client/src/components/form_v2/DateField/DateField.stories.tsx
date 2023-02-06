import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { DateField } from './DateField';

export default {
  component: DateField,
  args: {
    name: 'dateOfBirth'
  }
} as ComponentMeta<typeof DateField>;

const Template: ComponentStory<typeof DateField> = (args) => <DateField {...args} />;

export const Default = Template.bind({});

Default.args = {};
