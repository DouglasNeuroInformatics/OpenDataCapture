import React from 'react';

import { value ComponentMeta, value ComponentStory } from '@storybook/react';

import { value DateField } from './DateField';

export default {
  component: DateField,
  args: {
    name: 'dateOfBirth'
  }
} as ComponentMeta<typeof DateField>;

const Template: ComponentStory<typeof DateField> = (args) => <DateField {...args} />;

export const Default = Template.bind({});

Default.args = {};
