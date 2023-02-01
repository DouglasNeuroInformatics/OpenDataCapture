import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Link } from './Link';

export default {
  component: Link,
  args: {
    to: '#'
  }
} as ComponentMeta<typeof Link>;

const Template: ComponentStory<typeof Link> = (props) => (
  <MemoryRouter>
    <Link {...props}>Hello</Link>
  </MemoryRouter>
);

export const Default = Template.bind({});

Default.args = {};

export const BtnDark = Template.bind({});

BtnDark.args = {
  variant: 'btn-dark'
};

export const BtnLight = Template.bind({});

BtnLight.args = {
  variant: 'btn-light'
};
