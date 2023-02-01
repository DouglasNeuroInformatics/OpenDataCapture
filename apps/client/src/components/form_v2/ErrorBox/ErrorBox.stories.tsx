import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ErrorBox } from './ErrorBox';

export default {
  component: ErrorBox,
  args: {
    message: 'An unknown error occurred'
  }
} as ComponentMeta<typeof ErrorBox>;

const Template: ComponentStory<typeof ErrorBox> = (args) => <ErrorBox {...args} />;

export const Default = Template.bind({});

Default.args = {};
